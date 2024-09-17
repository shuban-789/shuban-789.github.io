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
        name="Maglev"
        description="A Versatile Remote Access Swiss Army Knife"
        link="https://github.com/shuban-789/maglev"
        img={{
          src: '/assets/images/project-m.png',
          alt: 'maglev image',
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
