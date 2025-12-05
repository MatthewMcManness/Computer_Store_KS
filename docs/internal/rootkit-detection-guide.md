# Rootkit Detection Guide

**Internal Use Only** - Computer Store Kansas Staff Reference

## What Are Rootkits?

Rootkits are stealthy malware designed to hide their presence (and often other malware) from the operating system and security software. They can:
- Hide files, processes, and registry entries
- Intercept system calls
- Persist through reboots
- Give attackers remote access
- Be extremely difficult to remove without a full OS reinstall

## Warning Signs of Rootkit Infection

Look for these symptoms that standard malware scans might miss:

1. **Unexplained system slowdown** - especially if scans show nothing
2. **Antivirus disabled or won't stay enabled**
3. **Task Manager or other system tools won't open or crash immediately**
4. **Network activity when computer should be idle**
5. **Settings change back after being modified**
6. **Blue screens with no apparent cause**
7. **Windows updates failing repeatedly**
8. **System files showing unexpected modification dates**

## Detection Tools

### 1. GMER (Free) - Primary Tool
**Download:** http://www.gmer.net/

GMER is specifically designed for rootkit detection.

**How to use:**
1. Download and run (no install needed)
2. Click "Scan" and wait for completion
3. Look for RED entries - these indicate hidden items
4. Check the following tabs:
   - **Processes** - hidden processes
   - **Modules** - hidden drivers/DLLs
   - **Services** - hidden services
   - **Files** - hidden files
   - **Registry** - hidden registry entries

**Red flags:**
- Any entry marked in red
- Services with random/gibberish names
- Drivers you don't recognize
- Hidden files in System32 or Windows directories

### 2. Kaspersky TDSSKiller (Free)
**Download:** https://support.kaspersky.com/common/disinfection/5350

Specifically targets TDL/TDSS family rootkits (very common).

**How to use:**
1. Download and run
2. Click "Start Scan"
3. If threats found, select "Cure" or "Delete"
4. Reboot if prompted

### 3. Malwarebytes Anti-Rootkit (Free)
**Download:** https://www.malwarebytes.com/antirootkit

**How to use:**
1. Download and extract
2. Run mbar.exe as Administrator
3. Update when prompted
4. Click "Scan"
5. If threats found, click "Cleanup"
6. Reboot when prompted

### 4. RogueKiller (Free version available)
**Download:** https://www.adlice.com/roguekiller/

Good for detecting MBR (Master Boot Record) rootkits.

**How to use:**
1. Download and run
2. Click "Start Scan"
3. Review results - focus on "Hidden" and "Suspicious" items
4. Remove confirmed threats

### 5. Windows Defender Offline Scan (Built-in)
Scans before Windows fully loads, catching some rootkits.

**How to use:**
1. Settings > Update & Security > Windows Security
2. Virus & threat protection > Scan options
3. Select "Microsoft Defender Offline scan"
4. Click "Scan now" - computer will reboot

## Detection Process (Recommended Order)

### Step 1: Safe Mode Preparation
1. Boot into Safe Mode with Networking
2. This prevents many rootkits from loading

### Step 2: Run TDSSKiller First
- Quick scan, catches common rootkits
- Low false positive rate

### Step 3: Run GMER
- More thorough, catches what TDSSKiller misses
- Document any red entries before taking action

### Step 4: Run Malwarebytes Anti-Rootkit
- Different detection engine
- Good secondary confirmation

### Step 5: Check MBR/Boot Sector
- Use RogueKiller to scan boot areas
- Boot sector rootkits survive OS reinstalls on same drive

## Manual Checks

### Check Running Processes
```
Open Command Prompt as Admin:
tasklist /svc

Look for:
- Processes with no description
- Multiple instances of system processes (svchost is normal to have many, but unusual counts of others)
- Processes using high CPU/memory with generic names
```

### Check Startup Items
```
Open Command Prompt as Admin:
wmic startup list full

Or use Autoruns from Sysinternals (more thorough):
https://docs.microsoft.com/en-us/sysinternals/downloads/autoruns
```

### Check Network Connections
```
Open Command Prompt as Admin:
netstat -ano

Look for:
- Connections to unknown IPs
- Listening ports you don't recognize
- Connections when no browser/apps are open
```

### Check Hosts File
```
Open: C:\Windows\System32\drivers\etc\hosts

Should only contain:
# Comments
127.0.0.1 localhost

If there are other entries redirecting websites, that's suspicious.
```

## When to Recommend Fresh Install

Recommend OS reinstall instead of removal when:

1. **Multiple rootkits detected** - where there's one, there's often more
2. **Boot sector/MBR infection** - can survive normal reinstall (need to wipe drive)
3. **Removal tools fail repeatedly** - rootkit is actively defending itself
4. **System files are compromised** - too many modified system files
5. **Unknown duration of infection** - customer has no idea how long it's been there
6. **Banking/sensitive data at risk** - customer does online banking, etc.
7. **Time factor** - if cleaning will take 4+ hours, fresh install may be faster

**Important:** For boot sector rootkits, must fully wipe/format the drive, not just reinstall Windows over existing installation.

## Post-Removal Verification

After removing a rootkit:

1. **Reboot and rescan** with all tools
2. **Check that security software stays enabled**
3. **Monitor for 24-48 hours** if possible before returning to customer
4. **Run Windows Update** - ensure it completes successfully
5. **Check browser settings** weren't modified
6. **Recommend password changes** - assume credentials were compromised

## Customer Communication

When explaining rootkits to customers:

- "This is a more serious type of infection that hides from normal antivirus"
- "It may have been collecting information like passwords"
- "We recommend [fresh install/password changes] because..."
- Don't scare them unnecessarily, but be honest about severity

## Resources

- **Sysinternals Suite:** https://docs.microsoft.com/en-us/sysinternals/
- **VirusTotal:** https://www.virustotal.com/ (upload suspicious files)
- **Hybrid Analysis:** https://www.hybrid-analysis.com/ (detailed malware analysis)

---

*Last updated: December 2024*
*Review and update tool download links quarterly*
