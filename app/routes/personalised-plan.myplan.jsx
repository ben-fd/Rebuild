import {annotate} from 'rough-notation';
import {useLoaderData} from '@remix-run/react';
import {useEffect} from 'react';
import {getTagObjects} from '~/components/Personalisation';

export async function loader({request, params, context}) {
  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const tags = searchParams?.get('tags').split(',') || [];
  const sorts = searchParams?.get('sorts').split(',') || [];

  const selectedTags = getTagObjects(tags);
  const selectedSorts = getTagObjects(sorts);
  return {selectedTags, selectedSorts};
}

//loop through tag mappings and return the tag objects that match current tags

export default function MyPlan() {
  const loader = useLoaderData();
  const {selectedTags, selectedSorts} = loader;
  return (
    <div className="flex flex-col">
      <BannerSection>
        <YourRecommendedPlan></YourRecommendedPlan>
      </BannerSection>
      <PlanReassurance
        tags={selectedTags}
        sorts={selectedSorts}
      ></PlanReassurance>
    </div>
  );
}

function YourRecommendedPlan() {
  useEffect(() => {
    const bracketsTitle = document.getElementById('bracketsTitle');
    const annotation = annotate(bracketsTitle, {
      type: 'highlight',
      color: '#FDC9CB4d',
      strokeWidth: 2,
    });
    annotation.show();
  }, []);

  return (
    <div className="flex flex-row flex-wrap gap-8 p-8 max-w-[1690px] justify-center justify-items-center items-center">
      <img
        width="400"
        height="400"
        aspect-ratio="1"
        alt="banner image"
        className=" col-span-1 image-full"
        src="https://cdn.shopify.com/s/files/1/0271/2662/8450/files/Meals_BG.png?v=1701170483"
      />

      <div className="col-span-1 flex flex-col gap-2">
        <h1 className="text-5xl md:text-6xl leading-relaxed font-thin">
          your{' '}
          <span id="bracketsTitle" className=" font-bold">
            personalised
          </span>{' '}
          <br />
          14 meal plan
        </h1>

        <ul className="list-disc list-inside text-lg">
          <li className="list-item">
            dietitian-designed, chef-made frozen meals
          </li>
          <li className="list-item">personalised for your health</li>
          <li className="list-item">
            2 meals a day x 14 days, or 1 meal a day x 2 weeks
          </li>
        </ul>
      </div>
    </div>
  );
}

function PlanReassurance({tags, sorts}) {
  return (
    <section className="w-full bg-neutral flex flex-wrap gap-4 align-middle justify-center items-center">
      <h2 className="text-3xl">personalised for your health:</h2>
      <div className="carousel gap-8 p-4 space-x-4 bg-neutral">
        {sorts?.map((sort) => {
          return <CarouselItem key={sort.title} tag={sort}></CarouselItem>;
        })}
        {tags?.map((tag) => {
          return <CarouselItem key={tag.title} tag={tag}></CarouselItem>;
        })}
      </div>
      <div></div>
    </section>
  );
}
function BannerSection({children}) {
  return (
    <section className=" bg-cover bg-hero-texture bg-no-repeat w-full">
      <div className="p-8">{children}</div>
    </section>
  );
}

function CarouselItem({tag}) {
  return (
    <carousel-item className="carousel-item  h-full">
      <div className="card card-compact card-side outline-1 outline outline-secondary  h-full">
        <figure>
          <img
            width="150"
            height="150"
            className="object-cover w-20 h-20"
            src="https://cdn.shopify.com/s/files/1/0271/2662/8450/files/Meals_BG.png?v=1701170483"
            alt=""
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title lowercase">{tag.title}</h2>
          <p className="w-96">{tag?.description}</p>
        </div>
      </div>
    </carousel-item>
  );
}
