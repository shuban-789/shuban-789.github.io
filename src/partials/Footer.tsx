import { Section } from 'astro-boilerplate-components';

import { AppConfig } from '@/utils/AppConfig';

const Footer = () => (
  <Section>
    <footer>
      {/* Custom footer content */}
      <p>&copy; {new Date().getFullYear()} {AppConfig.site_name}. All rights reserved.</p>
    </footer>
  </Section>
);

export { Footer };