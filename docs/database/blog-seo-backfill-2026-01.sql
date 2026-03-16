-- Blog SEO Backfill Migration - January 21-27, 2026
-- Created: 2026-01-27
-- Author: Matthew McManness
-- Description: Adds 4 SEO-optimized blog posts (Jan 21, 23, 25, 27)
--
-- Run this in Supabase SQL Editor to populate the blog with backfill content.

-- Post 1: January 21, 2026 - Signs of Malware / Virus Detection
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image_url, category_id, author_name, status, published_at, created_at)
SELECT
  'How to Tell If Your Computer Has a Virus in 2026',
  'how-to-tell-computer-has-virus-2026',
  'Worried your computer might be infected? Here are the telltale signs of malware and what to do about virus removal in 2026.',
  '## Is Your Computer Acting Strange?

Your computer has been slow lately. Pop-ups keep appearing. Programs crash for no reason. Sound familiar? These could be signs your computer has a virus or malware infection, and ignoring them only makes things worse.

At Computer Store KS in Topeka, we handle virus removal every week. Here are the warning signs we tell our customers to watch for, and what you should do if you spot them.

### Common Signs Your Computer Has a Virus

#### 1. Sudden Slowdowns

If your computer was running fine last week and now takes forever to open programs or load web pages, malware could be eating up your system resources in the background.

**What to check:**
- Open Task Manager (Ctrl + Shift + Esc)
- Look at the **Processes** tab
- Sort by CPU or Memory usage
- Unknown programs using high resources are suspicious

#### 2. Pop-Ups Everywhere

Legitimate software rarely bombards you with pop-ups. If you''re seeing:
- Ads on your desktop
- Browser pop-ups you can''t close
- Fake "Your computer is infected!" warnings
- Redirects to strange websites

These are classic signs of adware or scareware infections.

#### 3. Programs You Didn''t Install

Check your installed programs list. If you see software you don''t remember installing, malware may have added it. Common culprits include:
- Browser toolbars
- "System optimizer" tools
- Unknown antivirus programs
- Random games or utilities

#### 4. Your Browser Has Been Hijacked

Browser hijacking is one of the most common malware symptoms:
- Your homepage changed without your permission
- Default search engine switched to something unfamiliar
- New toolbars or extensions appeared
- Searches redirect to odd websites

#### 5. Unusual Network Activity

Malware often communicates with external servers:
- Internet feels slower than usual
- Data usage spikes unexpectedly
- Your router activity light blinks constantly even when idle
- Emails sent from your account that you didn''t write

#### 6. Antivirus Is Disabled

Some malware specifically targets your security software. If your antivirus suddenly won''t open, can''t update, or has been turned off, take that very seriously.

#### 7. Files Are Missing or Changed

Ransomware and destructive malware can:
- Encrypt your files (you''ll see strange extensions like .locked or .encrypted)
- Delete documents or photos
- Change file names
- Create new files you didn''t make

### What to Do If You Suspect an Infection

**Step 1: Disconnect from the Internet**

Pull the Ethernet cable or turn off Wi-Fi. This prevents the malware from spreading or sending your data to attackers.

**Step 2: Enter Safe Mode**

1. Restart your computer
2. Press **Shift** while clicking Restart (Windows 10/11)
3. Choose **Troubleshoot > Advanced options > Startup Settings > Restart**
4. Press **4** for Safe Mode with Networking

**Step 3: Run a Full Scan**

Use a reputable antivirus or anti-malware tool:
- **Windows Defender** (built into Windows, actually quite good)
- **Malwarebytes** (free version catches what others miss)
- **HitmanPro** (excellent second-opinion scanner)

Run full scans, not quick scans. This takes longer but checks everything.

**Step 4: Remove Detected Threats**

Follow your security software''s recommendations to quarantine or remove threats. Restart when prompted.

**Step 5: Change Your Passwords**

After cleaning the infection, change passwords for:
- Email accounts
- Banking and financial sites
- Social media
- Any site where you store payment info

Use a different, clean device if possible.

### How to Prevent Future Infections

Prevention is always easier than removal:

1. **Keep Windows updated** - Security patches fix vulnerabilities
2. **Use reputable antivirus** - Windows Defender plus Malwarebytes is a solid free combo
3. **Don''t click suspicious links** - In emails, texts, or social media
4. **Download software from official sources** - Not random websites
5. **Use strong, unique passwords** - A password manager helps
6. **Enable two-factor authentication** - Especially for email and banking
7. **Back up your data** - So ransomware can''t hold you hostage

### When to Get Professional Help

Some infections are stubborn. Bring your computer to us if:

- You''ve tried scanning but problems persist
- Your computer won''t boot normally
- Ransomware has encrypted your files
- You suspect someone has access to your accounts
- You''re not comfortable removing malware yourself

### Our Virus Removal Service

At Computer Store KS, our virus removal process includes:

- **Full diagnostic** to identify all threats
- **Complete malware removal** using professional tools
- **System optimization** after cleanup
- **Security hardening** to prevent reinfection
- **Data recovery** if files were affected

We see computers from across the Topeka area with malware issues. Most can be cleaned and returned the same day.

### Don''t Ignore the Signs

The longer malware stays on your computer, the more damage it does. If something feels off, trust your instincts and get it checked. A quick diagnosis now can prevent identity theft, data loss, or a completely bricked computer later.

*Think your computer might be infected? Bring it to Computer Store KS for a professional diagnosis and cleaning.*',
  'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1200',
  (SELECT id FROM blog_categories WHERE slug = 'tech-tips'),
  'Matthew McManness',
  'published',
  '2026-01-21 10:00:00+00',
  '2026-01-21 10:00:00+00'
ON CONFLICT (slug) DO NOTHING;

-- Post 2: January 23, 2026 - Upgrading an Old Computer
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image_url, category_id, author_name, status, published_at, created_at)
SELECT
  'Is It Worth Upgrading Your Old Computer? RAM, SSD, and More',
  'is-it-worth-upgrading-old-computer-ram-ssd',
  'Before you buy a new computer, consider upgrading what you have. Here''s an honest look at which upgrades are worth it and which aren''t.',
  '## Don''t Replace It Yet — Upgrade It

That sluggish computer sitting on your desk might not need replacing. Some of the most dramatic performance improvements come from affordable upgrades that breathe new life into aging hardware.

As a repair shop in Topeka that works on computers of all ages, we help customers make this decision every day at Computer Store KS. Here''s our honest breakdown of which upgrades are worth your money.

### The #1 Upgrade: Add an SSD

If your computer still has a traditional hard drive (HDD), upgrading to a solid-state drive (SSD) is the single best upgrade you can make. Period.

**What you''ll notice:**
- Boot time drops from 2-3 minutes to 15-30 seconds
- Programs open almost instantly
- File transfers are dramatically faster
- The whole system feels like a new computer

**Cost:** $40-80 for a 500GB SSD, $60-120 for 1TB

**Is it worth it?** Absolutely, for almost any computer less than 10 years old. This is the upgrade we recommend most often because the improvement is so dramatic and the cost is so low.

### The #2 Upgrade: More RAM

RAM (memory) determines how many things your computer can do at once. If you''re running low, everything slows to a crawl.

**Signs you need more RAM:**
- Computer freezes when multiple programs are open
- Browser tabs cause slowdowns
- You see "low memory" warnings
- Task Manager shows 90%+ memory usage

**How much do you need?**

| Usage | Minimum | Recommended |
|-------|---------|-------------|
| Basic (web, email, documents) | 8GB | 8GB |
| Moderate (many tabs, light editing) | 8GB | 16GB |
| Heavy (gaming, video editing) | 16GB | 32GB |

**Cost:** $25-50 for 8GB DDR4, $40-80 for 16GB DDR4

**Is it worth it?** Yes, if you''re currently at 4GB or 8GB and your computer supports more. Check Task Manager to see your current usage. If you''re regularly above 80%, more RAM will help.

### Battery Replacement (Laptops)

A laptop with a dead battery is basically a desktop. If yours only lasts 30 minutes unplugged, a new battery can restore hours of portable use.

**Cost:** $40-100 depending on the laptop

**Is it worth it?** Yes, if the laptop otherwise works well and the battery is replaceable. Some newer laptops make this harder, but we can handle most models.

### When Upgrades Aren''t Worth It

Not every computer should be upgraded. Here''s when you''re better off replacing:

**Don''t upgrade if:**
- The computer is 8+ years old (the CPU becomes the bottleneck)
- The motherboard is failing (investing in a dying platform)
- Multiple components need replacing (costs add up fast)
- You need capabilities the hardware can''t support (like modern gaming on integrated graphics)
- The laptop has a non-replaceable soldered SSD or RAM

**The math:** If upgrades would cost more than 50% of a replacement, buy new.

### The Best Upgrade Combos

#### Budget Refresh ($60-100)
- SSD upgrade (clone existing drive)
- Fresh Windows install
- **Result:** Computer feels 3-5 years newer

#### Performance Boost ($100-180)
- SSD upgrade
- RAM upgrade to 16GB
- **Result:** Handles modern workloads comfortably

#### Full Refresh ($150-250)
- SSD upgrade
- RAM upgrade
- Fresh OS install
- New thermal paste (if overheating)
- **Result:** Maximum performance from existing hardware

### What About CPU and GPU Upgrades?

**CPU upgrades** are rarely worth it on older systems. You''d typically need a new motherboard too, which means new RAM, and at that point you''re building a new computer.

**GPU upgrades** can make sense for desktops if:
- The power supply can handle a new card
- The CPU won''t bottleneck the new GPU
- You''re adding gaming capability to a capable system

We can assess whether a GPU upgrade makes sense for your specific setup.

### DIY vs. Professional Installation

**Do it yourself if:**
- You''re comfortable opening your computer
- It''s a desktop with easy access
- You''ve watched a tutorial and feel confident

**Have us do it if:**
- It''s a laptop (trickier to open)
- You want the old drive cloned to the new SSD
- You''re not sure what''s compatible
- You''d rather not risk breaking something

### Our Upgrade Services

At Computer Store KS, we offer:

- **Free assessment** — We''ll tell you honestly if upgrading makes sense
- **SSD installation with cloning** — Keep all your files and programs
- **RAM upgrades** — We''ll check compatibility and install
- **Combo packages** — Bundle upgrades for the best value
- **Used parts** — Quality tested components at lower prices

### The Bottom Line

An SSD upgrade is almost always worth it. RAM is worth it if you''re running low. Everything else depends on your specific situation.

Before you spend $500+ on a new computer, spend 10 minutes talking to us. We''ll give you an honest answer about whether a $100 upgrade can get you another 3-5 years of solid performance.

*Wondering if your computer is worth upgrading? Bring it to Computer Store KS for a free assessment.*',
  'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200',
  (SELECT id FROM blog_categories WHERE slug = 'repairs-maintenance'),
  'Matthew McManness',
  'published',
  '2026-01-23 10:00:00+00',
  '2026-01-23 10:00:00+00'
ON CONFLICT (slug) DO NOTHING;

-- Post 3: January 25, 2026 - Scam Pop-Ups and Fake Tech Support
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image_url, category_id, author_name, status, published_at, created_at)
SELECT
  'Protect Yourself from Scam Pop-Ups and Fake Tech Support',
  'protect-yourself-scam-popups-fake-tech-support',
  'Those scary virus warnings on your screen are almost always fake. Here''s how to spot tech support scams and what to do if you encounter one.',
  '## That Scary Pop-Up Is Lying to You

You''re browsing the internet when suddenly your screen fills with a terrifying warning: "YOUR COMPUTER IS INFECTED! CALL THIS NUMBER IMMEDIATELY!" Your speakers blare an alarm. The page won''t close. It looks official, maybe even like it''s from Microsoft or Apple.

Take a deep breath. It''s fake.

At Computer Store KS in Topeka, we help customers recover from these scams regularly. Some catch it in time. Others unfortunately call the number first. Here''s everything you need to know to protect yourself.

### How Fake Virus Warnings Work

These scam pop-ups typically appear when you:
- Visit a compromised website
- Click a misleading ad
- Mistype a web address
- Follow a link from a phishing email

**What they show you:**
- Fake "Windows Defender" or "Microsoft Security" alerts
- Scary language about viruses, hackers, or identity theft
- A phone number to call for "immediate help"
- Sometimes a countdown timer to create panic
- Fake scanning animations

**What they want:**
- You to call their fake support number
- Remote access to your computer
- Your credit card information
- To install actual malware on your machine

### Red Flags That Scream "Scam"

**Real security software will NEVER:**
- Display a phone number to call
- Lock your browser with a full-screen warning
- Play alarm sounds through your speakers
- Tell you your "identity has been stolen"
- Ask you to pay with gift cards
- Request remote access through a pop-up

**Microsoft, Apple, and Google will NEVER:**
- Call you about a virus on your computer
- Send pop-ups with phone numbers
- Ask for payment via gift cards or wire transfer
- Request your password through a pop-up

### How to Close a Fake Pop-Up

**Don''t click anything on the pop-up itself.** Not even the "X" button — it might be fake.

**On Windows:**
1. Press **Ctrl + Shift + Esc** to open Task Manager
2. Find your browser in the list (Chrome, Firefox, Edge)
3. Click it and press **End Task**
4. When you reopen the browser, **don''t** restore the previous session

**On Mac:**
1. Press **Command + Option + Escape**
2. Select your browser
3. Click **Force Quit**

**If the pop-up won''t close:**
- Press **Alt + F4** (Windows) or **Command + Q** (Mac)
- As a last resort, hold the power button to shut down
- The pop-up is just a webpage — it has no real power over your computer

### What Happens If You Call the Number

Here''s the typical scam call flow:

1. **Convincing "technician"** answers, sounds professional
2. They ask you to **download remote access software** (TeamViewer, AnyDesk, etc.)
3. They "scan" your computer and show you fake "problems"
4. They claim you need expensive "repairs" ($200-$800)
5. They ask for **credit card info** or **gift cards**
6. While connected, they may **install actual malware** or **steal personal files**

### If You Already Called and Gave Access

**Act immediately:**

1. **Disconnect from the internet** — Unplug Ethernet or turn off Wi-Fi
2. **Uninstall remote access software** — Remove TeamViewer, AnyDesk, or whatever they had you install
3. **Run antivirus scans** — Use Windows Defender and Malwarebytes
4. **Change your passwords** — On a different device, change banking, email, and social media passwords
5. **Contact your bank** — If you paid them, report the fraud immediately
6. **Monitor your accounts** — Watch for unauthorized transactions
7. **Report the scam** — File at reportfraud.ftc.gov

### If You Paid with Gift Cards

Gift card payment is a hallmark of scams because it''s nearly untraceable. If you paid:
- Contact the gift card company immediately
- Some may be able to freeze the balance
- Report to the FTC at reportfraud.ftc.gov
- Unfortunately, recovery is difficult with gift cards

### Real vs. Fake: A Quick Comparison

| Feature | Real Alert | Fake Scam |
|---------|-----------|-----------|
| Source | Your installed antivirus | Web browser pop-up |
| Phone number | Never shows one | Always shows one |
| Sound | Silent or single beep | Loud alarms, voice warnings |
| Action | Quarantine/remove option | "Call now" or "pay now" |
| Language | Technical, calm | Urgent, scary, threatening |
| Closeable | Yes, normally | Often locks your browser |

### How to Prevent Scam Pop-Ups

1. **Use an ad blocker** — uBlock Origin is free and excellent
2. **Keep your browser updated** — Modern browsers block many scam sites
3. **Don''t click suspicious ads** — Especially "download" or "your computer is slow" ads
4. **Verify URLs** — Type website addresses directly instead of clicking links
5. **Educate family members** — Seniors are disproportionately targeted

### A Note About Seniors and Vulnerable Users

Tech support scams specifically target older adults and less tech-savvy users. If you have elderly parents or grandparents:
- Talk to them about these scams before they encounter one
- Set up an ad blocker on their browser
- Tell them to call **you** first, not the number on screen
- Make sure they know that real tech companies don''t call about viruses

### Our Scam Recovery Service

If you or someone you know fell for a tech support scam, bring the computer to Computer Store KS. We''ll:

- **Remove any malware** the scammers installed
- **Check for backdoors** and remote access tools
- **Verify your accounts** haven''t been compromised
- **Secure your system** against future attacks
- **Provide honest advice** on next steps

We''ve helped many Topeka-area residents recover from these scams. There''s no judgment here — these scammers are professional criminals who manipulate people for a living.

*Seen a suspicious pop-up? Don''t call the number. Call us or bring your computer to Computer Store KS instead.*',
  'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200',
  (SELECT id FROM blog_categories WHERE slug = 'tech-tips'),
  'Matthew McManness',
  'published',
  '2026-01-25 10:00:00+00',
  '2026-01-25 10:00:00+00'
ON CONFLICT (slug) DO NOTHING;

-- Post 4: January 27, 2026 - Refurbished Computers
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image_url, category_id, author_name, status, published_at, created_at)
SELECT
  'Are Refurbished Computers Worth It? A Repair Shop''s Honest Take',
  'are-refurbished-computers-worth-it-repair-shop',
  'As a computer repair shop that refurbishes machines daily, here''s our honest assessment of when refurbished PCs are a great deal and when to buy new.',
  '## The Truth About Refurbished Computers

We refurbish computers every day at Computer Store KS. We take old machines, replace worn parts, upgrade components, and test everything thoroughly. So when people ask us "are refurbished computers worth it?" — we have a uniquely informed answer.

The short version: **Yes, often.** But not always, and not from every seller. Here''s how to make a smart decision.

### What "Refurbished" Actually Means

The term gets used loosely, so let''s clarify:

**Factory Refurbished (OEM):**
- Returned to the manufacturer
- Repaired to original specifications
- Full testing and quality control
- Often includes manufacturer warranty
- Best quality, highest price for refurbished

**Certified Refurbished (Third-Party):**
- Restored by an authorized refurbisher
- Tested and certified to work properly
- May include upgraded components
- Usually includes a warranty
- Good balance of quality and price

**Seller Refurbished / Renewed:**
- Restored by the seller
- Quality varies significantly
- May just mean "tested and wiped"
- Warranty depends on seller
- Buyer beware — do your research

**What we do at Computer Store KS:**
- Complete hardware diagnostic
- Replace any failing components
- Upgrade SSD and RAM when needed
- Fresh Windows installation
- Thorough testing under load
- Clean inside and out
- Honest description of condition

### When Refurbished Is a Great Deal

#### For Basic Computing
If you need a computer for web browsing, email, documents, and streaming, a refurbished machine is often perfect. A 3-4 year old business-class laptop with an SSD upgrade handles these tasks beautifully.

**Example:** A refurbished Dell Latitude with an i5, 16GB RAM, and 256GB SSD for $200-300 vs. $600+ new for similar specs.

#### For Students
Students need reliable computers, not the latest hardware. A refurbished laptop can save hundreds that are better spent on textbooks (or pizza).

**What to look for:**
- 8GB RAM minimum (16GB preferred)
- SSD storage (not HDD)
- Working battery (at least 3-4 hours)
- Good screen condition

#### For Business Use
Business-class refurbished computers (Dell Latitude, HP EliteBook, Lenovo ThinkPad) are built to last. These machines were designed for 5-7 years of daily use, so at 3-4 years old they still have plenty of life.

**Why business-class is better:**
- More durable construction
- Better keyboards and trackpads
- Easier to repair and upgrade
- More ports and connectivity
- Longer manufacturer support

#### For Kids
A refurbished computer is perfect for kids learning to use technology. If it gets dropped, spilled on, or mishandled, you''re out $200 instead of $800.

### When to Buy New Instead

**Buy new if:**
- You need the latest GPU for gaming or creative work
- Battery life is critical and you need 10+ hours
- You want the thinnest, lightest laptop possible
- Specific new features matter (like a high-refresh display)
- You need a specific warranty length for business
- You''re buying for a role that demands cutting-edge specs

**The sweet spot:** If your budget is under $400, refurbished almost always gives you better specs per dollar. Above $800, buying new starts making more sense because you''re getting current-generation hardware.

### What to Check Before Buying Refurbished

#### From Any Seller
1. **Battery health** (laptops) — Ask for cycle count or health percentage
2. **Screen condition** — Check for dead pixels, scratches, or discoloration
3. **Keyboard and trackpad** — Test every key
4. **Ports** — Test USB, HDMI, headphone jack
5. **Wi-Fi and Bluetooth** — Connect and verify
6. **Storage type** — Confirm it has an SSD, not an HDD
7. **Warranty** — What''s covered and for how long?
8. **Return policy** — Can you return it if something''s wrong?

#### Red Flags
- No warranty at all
- Seller can''t tell you the exact specs
- Price seems too good to be true
- "As-is" condition with no testing
- No return policy

### Where to Buy Refurbished

**Best options (most to least reliable):**

1. **Local repair shops** (like us!) — You can see the machine, ask questions, and get local support
2. **Manufacturer refurbished** — Dell Outlet, Apple Refurbished, Lenovo Outlet
3. **Amazon Renewed** — Decent quality with Amazon''s return policy
4. **Back Market** — Specialized refurbished marketplace with grading system

**Be cautious with:**
- Random eBay sellers (quality varies wildly)
- Facebook Marketplace (no protection)
- Craigslist (test thoroughly before paying)

### Our Refurbished Inventory

At Computer Store KS, every refurbished computer we sell goes through our full process:

1. **Complete diagnostic** — Every component tested
2. **Component upgrades** — SSD and RAM upgrades where needed
3. **Fresh installation** — Clean Windows with latest updates
4. **Stress testing** — Run under load to catch hidden issues
5. **Physical cleaning** — Inside and out
6. **Honest grading** — We tell you exactly what condition it''s in

We carry refurbished desktops and laptops at our Topeka location. Our inventory changes regularly as we acquire and refurbish new machines.

### The Environmental Angle

Buying refurbished is one of the most impactful things you can do for e-waste reduction. Manufacturing a new laptop produces roughly 300-400 kg of CO2. Extending an existing computer''s life by 3-4 years avoids all of that.

### Our Honest Recommendation

As a shop that both sells refurbished computers and repairs new ones, here''s our advice:

- **Budget under $400?** Refurbished is almost always the smarter buy
- **Budget $400-700?** Compare refurbished vs. new carefully
- **Budget over $700?** Buy new unless you find an exceptional refurbished deal
- **Need it to last 5+ years?** Buy new with a warranty
- **Need it for 2-3 years?** Refurbished is perfect

The best refurbished deals are business-class laptops that are 2-3 years old with SSD and RAM upgrades. You get a $1000+ machine for $200-350.

*Want to see our current refurbished inventory? Stop by Computer Store KS in Topeka or check our gallery online.*',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
  (SELECT id FROM blog_categories WHERE slug = 'tech-tips'),
  'Matthew McManness',
  'published',
  '2026-01-27 10:00:00+00',
  '2026-01-27 10:00:00+00'
ON CONFLICT (slug) DO NOTHING;

-- Add tag associations
DO $$
DECLARE
  tag_how_to UUID;
  tag_troubleshooting UUID;
  tag_hardware UUID;
  tag_security UUID;
  post_virus UUID;
  post_upgrade UUID;
  post_scam UUID;
  post_refurb UUID;
BEGIN
  -- Get tag IDs
  SELECT id INTO tag_how_to FROM blog_tags WHERE slug = 'how-to' LIMIT 1;
  SELECT id INTO tag_troubleshooting FROM blog_tags WHERE slug = 'troubleshooting' LIMIT 1;
  SELECT id INTO tag_hardware FROM blog_tags WHERE slug = 'hardware' LIMIT 1;

  -- Create security tag if it doesn't exist
  INSERT INTO blog_tags (name, slug) VALUES ('Security', 'security')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO tag_security FROM blog_tags WHERE slug = 'security';

  -- Get post IDs
  SELECT id INTO post_virus FROM blog_posts WHERE slug = 'how-to-tell-computer-has-virus-2026' LIMIT 1;
  SELECT id INTO post_upgrade FROM blog_posts WHERE slug = 'is-it-worth-upgrading-old-computer-ram-ssd' LIMIT 1;
  SELECT id INTO post_scam FROM blog_posts WHERE slug = 'protect-yourself-scam-popups-fake-tech-support' LIMIT 1;
  SELECT id INTO post_refurb FROM blog_posts WHERE slug = 'are-refurbished-computers-worth-it-repair-shop' LIMIT 1;

  -- Post 1 tags: how-to, troubleshooting, security
  IF post_virus IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (post_virus, tag_how_to) ON CONFLICT DO NOTHING;
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (post_virus, tag_troubleshooting) ON CONFLICT DO NOTHING;
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (post_virus, tag_security) ON CONFLICT DO NOTHING;
  END IF;

  -- Post 2 tags: hardware, how-to
  IF post_upgrade IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (post_upgrade, tag_hardware) ON CONFLICT DO NOTHING;
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (post_upgrade, tag_how_to) ON CONFLICT DO NOTHING;
  END IF;

  -- Post 3 tags: security, how-to
  IF post_scam IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (post_scam, tag_security) ON CONFLICT DO NOTHING;
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (post_scam, tag_how_to) ON CONFLICT DO NOTHING;
  END IF;

  -- Post 4 tags: hardware
  IF post_refurb IS NOT NULL THEN
    INSERT INTO blog_post_tags (post_id, tag_id) VALUES (post_refurb, tag_hardware) ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- Verify insertions
SELECT
  title,
  slug,
  status,
  published_at::date as published_date,
  author_name
FROM blog_posts
WHERE slug IN (
  'how-to-tell-computer-has-virus-2026',
  'is-it-worth-upgrading-old-computer-ram-ssd',
  'protect-yourself-scam-popups-fake-tech-support',
  'are-refurbished-computers-worth-it-repair-shop'
)
ORDER BY published_at;
