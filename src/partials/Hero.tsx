import {
  HeroAvatar,
  HeroSocial,
  Section,
} from 'astro-boilerplate-components';

const Hero = () => (
  <Section>
    <HeroAvatar
      title={
        <>
          Hi, I'm{' '}
          <span className="text-sky-500">
            Shuban
          </span>{' '}
          👋
        </>
      }
      description={
        <>
          I'm a current Junior at Del Norte High School interested in applying computer science to various fields of other sciences. My blog will tackle topics such as math, cybersecurity, physics, general computer science, and competition writeups or reviews. Most of my projects are on {' '}
          <a className="text-sky-500 hover:underline" href="https://github.com/shuban-789">
            GitHub
          </a>.
        </>
      }
      avatar={
        <img
          className="h-8.03125 w-8.609375"
          src="/assets/images/avatar.png"
          alt="Avatar image"
          loading="lazy"
          style={{ borderRadius: '50%' }}
        />
      }
      socialButtons={
        <>
          <a href="https://github.com/shuban-789">
            <HeroSocial
              src="/assets/images/github.svg"
              alt="GitHub icon"
            />
          </a>
          <a href="https://gitlab.com/shuban-789">
            <HeroSocial
              src="/assets/images/gitlab.svg"
              alt="GitLab icon"
            />
          </a>
          <a href="https://mailto:cybergeek11929@gmail.com">
            <HeroSocial
              src="/assets/images/gmail.svg"
              alt="Gmail icon"
            />
          </a>
        </>
      }
    />
  </Section>
);

export { Hero };
