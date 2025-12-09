import { Octokit } from '@octokit/rest';

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

// Check if GitHub is configured
export function isGitHubConfigured(): boolean {
  return !!GITHUB_TOKEN;
}
