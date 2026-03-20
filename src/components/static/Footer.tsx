import Image from 'next/image';
import { LOCATIONS } from '@/lib/constants';

const locationKeys = Object.keys(LOCATIONS) as Array<keyof typeof LOCATIONS>;

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white text-center py-8 text-sm">
      <div className="flex flex-col items-center gap-4 w-[90%] max-w-[1200px] mx-auto px-4">
        <div className="flex justify-center mb-4 max-[600px]:flex-col max-[600px]:items-center max-[600px]:gap-6">
          {locationKeys.map((key, i) => {
            const loc = LOCATIONS[key];
            return (
              <div key={loc.name} className="flex items-stretch max-[600px]:flex-col max-[600px]:items-center">
                {i > 0 && (
                  <div className="w-px bg-white/25 mx-10 self-stretch max-[600px]:w-[60%] max-[600px]:h-px max-[600px]:mx-0 max-[600px]:mb-6" />
                )}
                <div className="text-center">
                  <h4 className="footer-silver-label text-lg font-bold mb-2.5 mt-0 tracking-wide uppercase">
                    {loc.name}
                  </h4>
                  <p className="my-1 leading-normal opacity-90 text-center">
                    <a
                      href={`tel:${loc.phone}`}
                      className="text-primary-500 no-underline transition-colors duration-normal hover:text-white"
                    >
                      {loc.phone}
                    </a>
                  </p>
                  <p className="my-1 leading-normal opacity-90 text-center">
                    {loc.addressLine1}<br />{loc.city}, {loc.state} {loc.zip}
                  </p>
                  <p className="text-[0.85rem] opacity-80 my-1 leading-normal text-center">
                    {loc.hours[0]}<br />{loc.hours[1]}<br />{loc.hours[2]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="m-0 opacity-90 text-center">&copy; {new Date().getFullYear()} Computer Store Kansas. All rights reserved.</p>
        <div className="flex items-center justify-center gap-2 mt-0 pt-4 border-t border-white/20 text-sm opacity-80">
          <Image
            src="/assets/rws-logo.svg"
            alt="Resilient Web Solutions"
            className="w-5 h-5 object-contain"
            width={24}
            height={24}
          />
          <p className="m-0 opacity-90 text-center">
            Created and Maintained by{' '}
            <a
              href="https://www.resilientwebsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 no-underline transition-colors duration-normal hover:text-white hover:underline"
            >
              Resilient Web Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
