import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedPosts, getCategories, type BlogPost, type BlogCategory } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Blog | Computer Store Kansas',
  description: 'Tech tips, computer repair guides, Linux tutorials, and news from Computer Store Kansas in Topeka, KS.',
  openGraph: {
    title: 'Blog - Computer Store Kansas',
    description: 'Tech tips, repair guides, and news from your local computer experts.',
    url: 'https://computerstoreks.com/blog',
  },
};

// Revalidate every 5 minutes
export const revalidate = 300;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="blog-card">
      {post.featured_image_url && (
        <Link href={`/blog/${post.slug}`} className="blog-card-image">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            width={400}
            height={225}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </Link>
      )}
      <div className="blog-card-content">
        {post.category && (
          <span className="blog-category-badge">{post.category.name}</span>
        )}
        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt && <p className="blog-excerpt">{post.excerpt}</p>}
        <div className="blog-meta">
          <span className="blog-author">{post.author_name}</span>
          <span className="blog-date">
            {post.published_at ? formatDate(post.published_at) : ''}
          </span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="blog-tags">
            {post.tags.map((tag) => (
              <span key={tag.id} className="blog-tag">
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function CategorySidebar({ categories }: { categories: BlogCategory[] }) {
  return (
    <aside className="blog-sidebar">
      <div className="sidebar-section">
        <h3>Categories</h3>
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={`/blog?category=${category.slug}`}>
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts(),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>Blog</h2>
          <p>Tech tips, guides, and news from your local computer experts.</p>
        </div>
      </section>

      {/* Blog Content */}
      <section className="blog-section">
        <div className="container">
          <div className="blog-layout">
            {/* Main Content */}
            <main className="blog-main">
              {posts.length === 0 ? (
                <div className="blog-empty">
                  <h3>No posts yet</h3>
                  <p>Check back soon for tech tips, guides, and news!</p>
                </div>
              ) : (
                <div className="blog-grid">
                  {posts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </main>

            {/* Sidebar */}
            {categories.length > 0 && (
              <CategorySidebar categories={categories} />
            )}
          </div>
        </div>
      </section>

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
