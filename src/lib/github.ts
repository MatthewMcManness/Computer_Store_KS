import { Octokit } from '@octokit/rest';
import type { GalleryData, GalleryComputer } from '@/types/gallery';

// GitHub configuration from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'matthewholman';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Computer_Store_KS';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'Computer-Store-KS';

// Initialize Octokit
const getOctokit = () => {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }
  return new Octokit({ auth: GITHUB_TOKEN });
};

// Get file content from GitHub
export async function getFileFromGitHub(path: string): Promise<string> {
  const octokit = getOctokit();

  const { data } = await octokit.repos.getContent({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    ref: GITHUB_BRANCH,
  });

  if ('content' in data) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }

  throw new Error('File not found or is a directory');
}

// Get file SHA for updates
export async function getFileSha(path: string): Promise<string> {
  const octokit = getOctokit();

  const { data } = await octokit.repos.getContent({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    ref: GITHUB_BRANCH,
  });

  if ('sha' in data) {
    return data.sha;
  }

  throw new Error('Could not get file SHA');
}

// Update file on GitHub
export async function updateFileOnGitHub(
  path: string,
  content: string,
  message: string
): Promise<{ sha: string; url: string }> {
  const octokit = getOctokit();

  // Get current file SHA
  const sha = await getFileSha(path);

  // Update file
  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch: GITHUB_BRANCH,
  });

  return {
    sha: data.commit.sha ?? '',
    url: data.commit.html_url ?? '',
  };
}

// Create new file on GitHub
export async function createFileOnGitHub(
  path: string,
  content: string,
  message: string
): Promise<{ sha: string; url: string }> {
  const octokit = getOctokit();

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    branch: GITHUB_BRANCH,
  });

  return {
    sha: data.commit.sha ?? '',
    url: data.commit.html_url ?? '',
  };
}

// Delete file from GitHub
export async function deleteFileFromGitHub(
  path: string,
  message: string
): Promise<{ sha: string }> {
  const octokit = getOctokit();

  // Get current file SHA
  const sha = await getFileSha(path);

  // Delete file
  const { data } = await octokit.repos.deleteFile({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    message,
    sha,
    branch: GITHUB_BRANCH,
  });

  return {
    sha: data.commit.sha ?? '',
  };
}

// Upload image to GitHub
export async function uploadImageToGitHub(
  filename: string,
  imageBuffer: Buffer,
  message: string,
  directory: string = 'public/assets/gallery'
): Promise<{ sha: string; url: string; path: string }> {
  const octokit = getOctokit();
  const path = `${directory}/${filename}`;

  // Check if file already exists
  let sha: string | undefined;
  try {
    sha = await getFileSha(path);
  } catch {
    // File doesn't exist, that's fine
  }

  const params: Parameters<typeof octokit.repos.createOrUpdateFileContents>[0] = {
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    message,
    content: imageBuffer.toString('base64'),
    branch: GITHUB_BRANCH,
  };

  if (sha) {
    params.sha = sha;
  }

  const { data } = await octokit.repos.createOrUpdateFileContents(params);

  return {
    sha: data.commit.sha ?? '',
    url: data.commit.html_url ?? '',
    path: `./${path}`,
  };
}

// Get gallery data from JSON file
export async function getGalleryData(): Promise<GalleryData> {
  try {
    const content = await getFileFromGitHub('src/data/gallery.json');
    return JSON.parse(content);
  } catch {
    // Return default empty gallery if file doesn't exist
    return {
      computers: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}

// Save gallery data to GitHub
export async function saveGalleryData(
  data: GalleryData,
  message: string = 'Update gallery data'
): Promise<{ sha: string; url: string }> {
  const content = JSON.stringify(data, null, 2);

  try {
    return await updateFileOnGitHub('src/data/gallery.json', content, message);
  } catch {
    // File might not exist yet, create it
    return await createFileOnGitHub('src/data/gallery.json', content, message);
  }
}

// Generate HTML for index.html update
export function generateGalleryHTML(computers: GalleryComputer[]): string {
  return computers.map((computer, index) => {
    // Determine badge based on Black Friday status
    let badgeClass: string, badgeText: string, ribbonHTML = '';
    if (computer.blackFriday?.enabled) {
      badgeClass = 'badge-black-friday';
      badgeText = 'Black Friday Sale';
      ribbonHTML = `
         <div class="bf-ribbon-corner">
         </div>`;
    } else {
      badgeClass = computer.category === 'custom' ? 'badge-custom' :
                    computer.category === 'new' ? 'badge-new' : 'badge-refurbished';
      // Show "New" for laptops with custom category
      if (computer.category === 'custom' && computer.type === 'laptop') {
        badgeText = 'New';
      } else {
        badgeText = computer.category === 'custom' ? 'Custom Build' :
                     computer.category === 'new' ? 'New' : 'Refurbished';
      }
    }

    // Determine price HTML
    let priceHTML: string;
    if (computer.blackFriday?.enabled) {
      priceHTML = `
          <span class="original-price">
           ${computer.blackFriday.originalPrice}
          </span>
          <span class="sale-price">
           ${computer.blackFriday.salePrice}
          </span>
          <span class="savings-badge">
           Save ${computer.blackFriday.discount}%
          </span>`;
    } else {
      priceHTML = computer.price;
    }

    // Generate specs HTML
    const warrantyLabels = ['Parts Warranty', 'Manufacturer Warranty', 'Free Diagnostics'];
    const specsHTML = computer.specs.map(spec => {
      const label = spec.label.replace(/::?$/, '').trim();

      if (warrantyLabels.includes(label)) {
        if (computer.blackFriday?.enabled) {
          const originalValue = label === 'Parts Warranty'
            ? computer.blackFriday.originalPartsWarranty
            : (label === 'Free Diagnostics' ? computer.blackFriday.originalFreeDiagnostics : null);

          if (originalValue) {
            return `
          <div class="spec-item">
           <strong style="text-decoration: line-through; opacity: 0.6;">
            ${originalValue}
           </strong>
           <strong style="color: #f6ad55;">
            ${spec.value}
           </strong>
           <strong>
            ${label}
           </strong>
          </div>`;
          }
        }
        return `
          <div class="spec-item">
           <strong>
            ${spec.value}
           </strong>
           <strong>
            ${label}
           </strong>
          </div>`;
      } else {
        return `
          <div class="spec-item">
           <strong>
            ${label}:
           </strong>
           ${spec.value}
          </div>`;
      }
    }).join('\n         ');

    return `
      <div class="gallery-card" data-category="${computer.category}" data-computer-id="${index + 1}" data-type="${computer.type}">
       <div class="gallery-card-inner">
        <div class="gallery-card-front">${ribbonHTML}
         <div class="gallery-card-badge ${badgeClass}">
          ${badgeText}
         </div>
         <div class="gallery-card-image">
          <img alt="${computer.name}" onerror="this.src='./assets/logo.png'" src="${computer.image}"/>
         </div>
        </div>
        <div class="gallery-card-back">
         <h3 class="gallery-card-title">
          ${computer.name}
         </h3>
         <div class="gallery-card-price">
          ${priceHTML}
         </div>
         <div class="gallery-card-specs">
         ${specsHTML}
         </div>
        </div>
       </div>
      </div>`;
  }).join('\n');
}

// Check if GitHub is configured
export function isGitHubConfigured(): boolean {
  return !!GITHUB_TOKEN;
}

// Get GitHub config info (for debugging)
export function getGitHubConfig() {
  return {
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    configured: isGitHubConfigured(),
  };
}
