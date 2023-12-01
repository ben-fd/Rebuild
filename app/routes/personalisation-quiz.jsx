import {
  PinkHighlight,
  BannerSection,
  PageContainer,
  PageContentContainer,
  AtomLottie,
  HeadingStacked,
  MainButtonLink,
  OutlineButtonLink,
} from '../components/PageUtils';

export async function loader({request, params, context}) {
  return null;
}

export default function PersonalisationQuiz() {
  return (
    <>
      <BannerSection>
        <div className="flex flex-wrap gap-8 md:p-8 justify-center justify-items-center items-center">
          <div className="">
            <HeadingStacked>
              create your <PinkHighlight>personalised plan</PinkHighlight>
              <br /> + save <strong>up to 20%</strong> on 2 orders
            </HeadingStacked>
          </div>
        </div>
      </BannerSection>
      <PageContainer>
        <PageContentContainer>
          <p>
            It can be hard to find the right meals to feed your health, but
            we're here to help.
            <br />
            This simple quiz will personalise meals to match your health goals.
          </p>

          <div className="flex flex-col gap-4 w-full">
            <MainButtonLink
              url={
                '/personalised-plan/offer?tags=diet-Low+FODMAP%2Cdiet-anything&sorts=health-muscles&init=true'
              }
            >
              start quiz
            </MainButtonLink>
            <OutlineButtonLink
              url={'/personalised-plan?tags=&sorts='}
              prefetch={false}
            >
              skip + see all meals
            </OutlineButtonLink>
          </div>
        </PageContentContainer>
      </PageContainer>
    </>
  );
}
