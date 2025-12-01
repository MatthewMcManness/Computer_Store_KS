import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-contact">
          <p><strong>Phone:</strong> <a href="tel:785-267-3223">785-267-3223</a></p>
          <p><strong>Address:</strong> 2008 SW Gage Blvd, Topeka, KS 66604</p>
        </div>
        <p className="footer-copyright">&copy; 2025 Computer Store Kansas. All rights reserved.</p>
        <Link href="/admin/login" className="btn admin-login-btn">Administrator Login</Link>
        <div className="footer-credit">
          <Image
            src="/assets/rws-logo.svg"
            alt="Resilient Web Solutions"
            className="rws-icon"
            width={24}
            height={24}
          />
          <p>Created and Maintained by <a href="https://www.resilientwebsolutions.com" target="_blank" rel="noopener noreferrer">Resilient Web Solutions</a></p>
        </div>
      </div>
    </footer>
  );
}
