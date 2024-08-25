import { Section } from 'astro-boilerplate-components';

const Footer = () => (
  <Section>
    <footer>
      {/* Custom footer content */}
      <p>&copy; {new Date().getFullYear()} Shuban Pal. All rights reserved.</p>
    </footer>
  </Section>
);

export { Footer };