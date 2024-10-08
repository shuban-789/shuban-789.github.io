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
          src: '/assets/images/maglev.png',
          alt: 'maglev image',
        }}
        category={
          <>
            <Tags color={ColorTags.SKY}>Go</Tags>
            <Tags color={ColorTags.ORANGE}>Linux</Tags>
          </>
        }
      />
      <Project
        name="SnapSpark"
        description="An Innovative Natural Fire Ignition Prediction System"
        link="https://github.com/SnapSpark-AI/SnapSpark"
        img={{
          src: '/assets/images/snapspark.png',
          alt: 'snapspark',
        }}
        category={
          <>
            <Tags color={ColorTags.BLUE}>Python</Tags>
            <Tags color={ColorTags.TEAL}>FastAPI</Tags>
          </>
        }
      />
    </div>
  </Section>
);

export { ProjectList };
