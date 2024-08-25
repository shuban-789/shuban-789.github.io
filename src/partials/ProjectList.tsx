import {
  ColorTags,
  GradientText,
  Project,
  Section,
  Tags,
} from 'astro-boilerplate-components';

const ProjectList = () => (
  <Section
    title={
      <>
        Recent <GradientText>Projects</GradientText>
      </>
    }
  >
    <div className="flex flex-col gap-6">
      <Project
        name="Bluefox"
        description="A Versatile Remote Access Swiss Army Knife"
        link="https://github.com/shuban-789/bluefox"
        img={{
          src: '/assets/images/project-bluefox.png',
          alt: 'bluefox image',
        }}
        category={
          <>
            <Tags color={ColorTags.SKY}>Go</Tags>
            <Tags color={ColorTags.ORANGE}>Linux</Tags>
          </>
        }
      />
    </div>
  </Section>
);

export { ProjectList };
