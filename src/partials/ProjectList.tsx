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
      <Project
        name="LinkID"
        description="An AES encryption enhanced blockchain system for protecting medical records through unique 8 digit id and private key pairs"
        link="https://github.com/TEAM-GOJO/LinkID-Blockchain"
        img={{
          src: '/assets/images/linkid.png',
          alt: 'linkid',
        }}
        category={
          <>
            <Tags color={ColorTags.SKY}>Go</Tags>
            <Tags color={ColorTags.AMBER}>Blockchain</Tags>
            <Tags color={ColorTags.AMBER}>AES</Tags>
          </>
        }
      />
    </div>
  </Section>
);

export { ProjectList };
