import Image from 'next/image';
import { LOCATIONS } from '@/lib/constants';

const locationKeys = Object.keys(LOCATIONS) as Array<keyof typeof LOCATIONS>;

export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-locations">
          {locationKeys.map((key, i) => {
            const loc = LOCATIONS[key];
            return (
              <div key={loc.name} className="footer-location-wrapper">
                {i > 0 && <div className="footer-location-divider" />}
                <div className="footer-location">
                  <h4 className="footer-location-label">{loc.name}</h4>
                  <p><a href={`tel:${loc.phone}`}>{loc.phone}</a></p>
                  <p>{loc.addressLine1}<br />{loc.city}, {loc.state} {loc.zip}</p>
                  <p className="footer-hours">{loc.hours[0]}<br />{loc.hours[1]}<br />{loc.hours[2]}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="footer-copyright">&copy; {new Date().getFullYear()} Computer Store Kansas. All rights reserved.</p>
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
