import {
  GradientText,
  HeroAvatar,
  HeroSocial,
  Section,
} from 'astro-boilerplate-components';

const Hero = () => (
  <Section>
    <HeroAvatar
      title={
        <>
          Hi there, I'm <GradientText>Shuban</GradientText> 👋
        </>
      }
      description={
        <>
          Hi, I'm Shuban. I'mm a current Junior at Del Norte High School interested in applying computer science to various fields of other sciences. My blog will tackle topics such as math, cybersecurity, physics, general computer science, and competition writeups or reviews. Here is my {' '}
          <a className="text-cyan-400 hover:underline" href="https://github.com/shuban-789">
            GitHub
          </a>{' '}
          which contains most of my projects and writeups.
        </>
      }
      avatar={
        <img
          className="h-8.03125 w-8.609375"
          src="/assets/images/avatar.png"
          alt="Avatar image"
          loading="lazy"
        />
      }
      socialButtons={
        <>
          <a href="/">
            <HeroSocial
              src="/assets/images/twitter-icon.png"
              alt="Twitter icon"
            />
          </a>
          <a href="/">
            <HeroSocial
              src="/assets/images/facebook-icon.png"
              alt="Facebook icon"
            />
          </a>
          <a href="/">
            <HeroSocial
              src="/assets/images/linkedin-icon.png"
              alt="Linkedin icon"
            />
          </a>
          <a href="/">
            <HeroSocial
              src="/assets/images/youtube-icon.png"
              alt="Youtube icon"
            />
          </a>
        </>
      }
    />
  </Section>
);

export { Hero };
