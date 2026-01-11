/**
 * Seed script to create initial blog posts for Computer Store Kansas.
 *
 * Creates 4 foundational blog posts covering Linux benefits, Windows 10 end-of-support,
 * new ownership announcement, and phone repair partnership. Posts are inserted with
 * proper slugs, categories, and published timestamps. Skips posts that already exist
 * based on slug to ensure idempotent execution.
 *
 * @sideEffects
 * - Reads .env file to load environment variables
 * - Inserts records into blog_posts table
 * - Logs seeding progress and errors to console
 *
 * @example
 * // Run via: bun scripts/seed-blog-posts.ts
 *
 * @functions_called loadEnv, seedBlogPosts, createClient
 * @called_by CLI execution only
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Manually parses .env file and loads variables into process.env.
 *
 * Reads .env file line by line, parses key=value pairs, and sets them
 * as environment variables. Strips quotes from values and ignores comments.
 * Used because bun may not automatically load .env in all contexts.
 *
 * @returns {void}
 *
 * @sideEffects
 * - Reads .env file from project root
 * - Modifies process.env with parsed variables
 * - Logs error if .env file cannot be loaded
 *
 * @example
 * loadEnv() // Loads all variables from .env
 *
 * @functions_called readFileSync
 * @called_by Main script execution
 */
function loadEnv() {
  const envPath = join(process.cwd(), '.env');
  try {
    const content = readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      }
    }
  } catch (e) {
    console.error('Failed to load .env file');
  }
}

loadEnv();

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET');
console.log('Service Key:', supabaseServiceKey ? 'SET (length: ' + supabaseServiceKey.length + ')' : 'NOT SET');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  author_name: string;
  author_email: string;
  status: 'published';
  published_at: string;
}

const blogPosts: BlogPostInput[] = [
  {
    title: 'Why Linux Might Be the Perfect Choice for Your Next Computer',
    slug: 'why-linux-perfect-choice-for-your-computer',
    excerpt: 'Discover the benefits of Linux - from enhanced security and privacy to breathing new life into older hardware. Learn why more people are making the switch.',
    content: `## Is It Time to Consider Linux?

If you've been following tech news, you've probably heard more and more about Linux. But what exactly is it, and could it be right for you? At Computer Store Kansas, we've been helping customers explore Linux for years, and we'd love to share why it might be the perfect fit for your needs.

## What Is Linux?

Linux is a free, open-source operating system that powers everything from smartphones (Android is based on Linux!) to supercomputers. Unlike Windows or macOS, Linux is developed by a global community of volunteers and companies, which means it's constantly improving and completely free to use.

## Top Benefits of Linux

### 1. It's Completely Free

No more expensive operating system licenses. Linux distributions like Ubuntu, Linux Mint, and Zorin OS are 100% free to download, install, and use. This alone can save you $100-200 on a new computer build.

### 2. Enhanced Security

Linux is inherently more secure than Windows. Viruses and malware targeting Linux are extremely rare, and the open-source nature means security vulnerabilities are found and fixed quickly by the community. Say goodbye to expensive antivirus subscriptions!

### 3. Privacy First

Unlike some other operating systems, most Linux distributions don't track your activities or collect your data. You're in complete control of your computer and your information.

### 4. Breathe New Life Into Old Hardware

That old laptop gathering dust? Linux can make it run like new. Linux distributions are designed to be lightweight and efficient, making them perfect for older computers that struggle with modern Windows.

### 5. Customization Freedom

Want your desktop to look and work exactly how you want? Linux offers endless customization options. From the appearance to the functionality, you can make it truly yours.

### 6. No Forced Updates

Tired of Windows interrupting your work with mandatory updates? On Linux, you decide when to update and what to update. Your computer works for you, not the other way around.

## Is Linux Right for You?

Linux is ideal if you:
- Want to save money on software
- Value your privacy
- Have an older computer you'd like to keep using
- Are tired of bloatware and forced updates
- Want to try something new and learn

## We're Here to Help

At Computer Store Kansas, we specialize in Linux installations and support. Whether you want to completely switch to Linux or set up a dual-boot system alongside Windows, we can help make the transition smooth and painless.

**Stop by our store or give us a call to learn more about how Linux can transform your computing experience!**

*Image credit: [Unsplash](https://unsplash.com) - Free to use*`,
    featured_image_url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&h=800&fit=crop',
    author_name: 'Matthew McManness',
    author_email: 'matthew@thecomputerstoreks.com',
    status: 'published',
    published_at: new Date().toISOString(),
  },
  {
    title: 'Windows 10 End of Support: What You Need to Know About the Windows 11 Transition',
    slug: 'windows-10-end-of-support-windows-11-transition',
    excerpt: 'Microsoft is ending Windows 10 support in October 2025. Learn about your options, whether your computer can run Windows 11, and what alternatives exist.',
    content: `## The Clock Is Ticking on Windows 10

If you're still running Windows 10, it's time to start thinking about your next move. Microsoft has announced that **Windows 10 support will end on October 14, 2025**. After this date, your computer will no longer receive security updates, leaving it vulnerable to new threats.

## What Does "End of Support" Mean?

When Microsoft ends support for an operating system, they stop providing:
- Security updates and patches
- Bug fixes
- Technical support

While your computer will still work, it becomes increasingly risky to use for anything involving personal information, online banking, or sensitive data.

## Can Your Computer Run Windows 11?

This is where things get tricky. Windows 11 has stricter hardware requirements than Windows 10:

- **TPM 2.0 chip** (Trusted Platform Module)
- **Secure Boot capability**
- **8th generation Intel or newer** (or AMD Ryzen 2000 series or newer)
- **At least 4GB RAM** (8GB recommended)
- **64GB storage minimum**

Many computers purchased before 2018 don't meet these requirements, meaning a Windows 11 upgrade isn't officially supported.

## Your Options

### Option 1: Upgrade to Windows 11 (If Compatible)

If your computer meets the requirements, upgrading to Windows 11 is straightforward and currently free. The upgrade process preserves your files and most applications.

### Option 2: Purchase a New Computer

If your hardware doesn't support Windows 11, a new computer might be the best long-term investment, especially if your current machine is showing its age.

### Option 3: Switch to Linux

This is where we can really help! Linux is a fantastic alternative that:
- Runs great on older hardware
- Is completely free
- Is more secure than an unsupported Windows 10
- Doesn't have the strict hardware requirements of Windows 11

Many of our customers have been pleasantly surprised by how well Linux works for their daily tasks like web browsing, email, document editing, and more.

### Option 4: Continue Using Windows 10 (Not Recommended)

While technically possible, using an unsupported operating system puts your data and security at risk. We strongly advise against this option for everyday use.

## How We Can Help

At Computer Store Kansas, we offer:

- **Free compatibility checks** - We'll tell you if your computer can run Windows 11
- **Windows 11 upgrades** - Professional installation with data backup
- **Linux installations** - Give your older hardware a new lease on life
- **New and refurbished computers** - Pre-configured with Windows 11 or Linux
- **Data transfer services** - Move your files safely to your new system

## Don't Wait Until the Last Minute

October 2025 might seem far away, but it's better to plan ahead. Stop by our store to discuss your options and find the best solution for your needs and budget.

**Contact us today for a free consultation!**

*Image credit: [Unsplash](https://unsplash.com) - Free to use*`,
    featured_image_url: 'https://images.unsplash.com/photo-1624571409108-e9a41746af53?w=1200&h=800&fit=crop',
    author_name: 'Matthew McManness',
    author_email: 'matthew@thecomputerstoreks.com',
    status: 'published',
    published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    title: 'New Chapter, Same Great Service: Computer Store Kansas Under New Ownership',
    slug: 'new-ownership-computer-store-kansas',
    excerpt: 'We\'re excited to announce that Computer Store Kansas has new ownership! Learn about Max, our new owner, and our commitment to continued excellent service.',
    content: `## A New Chapter Begins

We're excited to share some big news with our valued customers: **Computer Store Kansas is under new ownership!** Jim, who built this business from the ground up and served the Topeka community for years, has passed the torch to Max, who is committed to continuing the tradition of excellent, honest computer service.

## A Heartfelt Thank You to Jim

Jim dedicated years to building Computer Store Kansas into the trusted local resource it is today. His commitment to fair pricing, honest service, and treating every customer like family set the foundation for everything we do. While Jim is moving on to new adventures, his legacy lives on in the values and standards he established.

Thank you, Jim, for everything you've done for our customers and community!

## Meet Max, Your New Owner

Max brings fresh energy and ideas while maintaining the core values that made Computer Store Kansas special:

- **Honest, transparent pricing** - No hidden fees or unnecessary upsells
- **Quality service** - Repairs done right the first time
- **Community focus** - We're your neighbors, not a faceless corporation
- **Expertise you can trust** - Years of experience in computer repair and builds

## What's Changing?

In short: **not much!** We're committed to:

- Keeping the same great location
- Maintaining competitive, fair pricing
- Providing the same quality repairs and services
- Continuing our focus on customer satisfaction

## What's New?

While we're keeping what works, Max is also bringing some improvements:

- **Expanded services** - Including more Linux support and custom PC builds
- **Updated inventory** - More refurbished laptops and desktops in stock
- **Enhanced online presence** - A new website and blog to keep you informed
- **Partnership opportunities** - Collaborating with other local tech businesses

## Our Commitment to You

The ownership may have changed, but our commitment to you hasn't:

- We'll continue to provide honest assessments and fair quotes
- We'll always explain what we're doing and why
- We'll treat your computer like it's our own
- We'll be here when you need us

## Stop By and Say Hello!

We'd love for you to stop by the store, meet Max, and see that Computer Store Kansas is the same great place you've always known. Whether you need a repair, are looking for a computer, or just want to chat about tech, our doors are always open.

**Thank you for your continued support as we begin this exciting new chapter!**

*Image credit: [Unsplash](https://unsplash.com) - Free to use*`,
    featured_image_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&h=800&fit=crop',
    author_name: 'Matthew McManness',
    author_email: 'matthew@thecomputerstoreks.com',
    status: 'published',
    published_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    title: 'Introducing Topeka Phone Repair: Mobile Device Services Now Available',
    slug: 'topeka-phone-repair-mobile-services',
    excerpt: 'Great news! Topeka Phone Repair now operates from our location, offering professional smartphone and Apple device repair services. Learn more about our new partner.',
    content: `## Expanding Our Services Through Partnership

We're thrilled to announce an exciting partnership: **Topeka Phone Repair** is now operating from our Computer Store Kansas location! This means you can now get both your computer AND mobile device needs handled in one convenient stop.

## About Topeka Phone Repair

Topeka Phone Repair specializes in professional repairs for:

- **iPhones** (all models)
- **iPads** and Apple tablets
- **Android smartphones**
- **Samsung Galaxy devices**
- **Other mobile devices and tablets**

## Services Offered

### Screen Repair

Cracked or shattered screen? Topeka Phone Repair can replace your screen quickly, often while you wait. They use quality replacement parts to get your device looking and working like new.

### Battery Replacement

Is your phone dying faster than it should? A battery replacement can give your device new life. This is often much more affordable than buying a new phone.

### Charging Port Repair

If your phone won't charge or the connection is loose, the charging port might need repair or replacement.

### Water Damage Recovery

Dropped your phone in water? Quick action and professional service can often save water-damaged devices.

### Apple Specialist Services

Topeka Phone Repair has particular expertise with Apple products, including:
- iPhone screen and battery replacement
- iPad repairs
- Apple Watch service
- Data recovery from iOS devices

## Why We Partnered

At Computer Store Kansas, we've always believed in providing comprehensive tech solutions. By partnering with Topeka Phone Repair, we can now offer:

- **One-stop tech service** - Computers AND phones in one location
- **Trusted expertise** - Professionals you can count on
- **Local business support** - Two local businesses working together
- **Convenient service** - Handle all your tech needs in one trip

## Quality You Can Trust

Topeka Phone Repair shares our commitment to:

- **Honest pricing** - Clear quotes with no surprises
- **Quality parts** - Reliable replacement components
- **Expert service** - Trained technicians who know their stuff
- **Customer satisfaction** - Standing behind their work

## Visit Us Today

Whether you need computer repair, a custom PC build, a mobile device fix, or all of the above, we've got you covered!

**Stop by Computer Store Kansas to meet the Topeka Phone Repair team and get your devices back in working order!**

### Contact Information

- **Location**: Computer Store Kansas (same address you know!)
- **Services**: Walk-ins welcome for most repairs
- **Estimates**: Free quotes on all repairs

We're excited about this partnership and what it means for our customers. Now you have even more reasons to choose local for all your tech needs!

*Image credit: [Unsplash](https://unsplash.com) - Free to use*`,
    featured_image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop',
    author_name: 'Matthew McManness',
    author_email: 'matthew@thecomputerstoreks.com',
    status: 'published',
    published_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

/**
 * Seeds initial blog posts into the Supabase database.
 *
 * Iterates through predefined blog posts array, checks if each slug already
 * exists in the database, and inserts new posts. Skips existing posts to
 * ensure script can be run multiple times safely (idempotent operation).
 *
 * @returns {Promise<void>} Resolves when all posts are processed
 *
 * @throws {Error} If database operations fail (logged but doesn't halt execution)
 *
 * @sideEffects
 * - Inserts blog post records into blog_posts table
 * - Logs creation status for each post to console
 *
 * @example
 * await seedBlogPosts() // Seeds all blog posts
 *
 * @functions_called supabase.from
 * @called_by Main script execution
 */
async function seedBlogPosts() {
  console.log('Starting blog post seeding...\n');

  for (const post of blogPosts) {
    console.log(`Creating post: "${post.title}"...`);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', post.slug)
      .single();

    if (existing) {
      console.log(`  ⚠️  Post with slug "${post.slug}" already exists, skipping.\n`);
      continue;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Error creating post:`, error.message);
    } else {
      console.log(`  ✅ Created successfully! ID: ${data.id}\n`);
    }
  }

  console.log('Blog post seeding complete!');
}

seedBlogPosts().catch(console.error);
