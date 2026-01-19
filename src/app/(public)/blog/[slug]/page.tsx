import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedPostBySlug, getPublishedPosts, type BlogPost } from '@/lib/supabase';
import BlogImage from '@/components/blog/BlogImage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all published posts
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Computer Store Kansas',
    };
  }

  return {
    title: `${post.title} | Computer Store Kansas Blog`,
    description: post.excerpt || `Read "${post.title}" on the Computer Store Kansas blog.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      url: `https://computerstoreks.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: [post.author_name],
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
  };
}

// Revalidate every 5 minutes
export const revalidate = 300;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Simple markdown-like rendering (for basic formatting)
function renderContent(content: string): string {
  // Convert markdown-style formatting to HTML
  let html = content
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Line breaks and paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');

  return `<p>${html}</p>`;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      {/* Hero with post title */}
      <section className="hero blog-hero">
        <div className="container">
          {post.category && (
            <span className="blog-category-badge hero-badge">{post.category.name}</span>
          )}
          <h2>{post.title}</h2>
          <div className="blog-hero-meta">
            <span>By {post.author_name}</span>
            <span>•</span>
            <span>{post.published_at ? formatDate(post.published_at) : ''}</span>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image_url && (
        <section className="blog-featured-image">
          <div className="container">
            <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <BlogImage
                src={post.featured_image_url}
                alt={post.title}
                width={1200}
                height={600}
              />
            </div>
          </div>
        </section>
      )}

      {/* Post Content */}
      <article className="blog-article">
        <div className="container">
          <div className="blog-content">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="blog-post-tags">
                <span className="tags-label">Tags:</span>
                {post.tags.map((tag) => (
                  <span key={tag.id} className="blog-tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Back to Blog */}
          <div className="blog-back">
            <Link href="/blog" className="btn btn-secondary">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Need Help With Your Computer?</h2>
          <p>Our experts are ready to assist with repairs, upgrades, custom builds, and more.</p>
          <Link href="/contact" className="btn btn-white">Contact Us</Link>
        </div>
      </section>
    </>
  );
}
