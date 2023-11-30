import {annotate} from 'rough-notation';
import {useLoaderData, Await} from '@remix-run/react';
import {Suspense, useEffect} from 'react';
import {getTagObjects} from '~/components/Personalisation';
import {useRouteLoaderData} from '@remix-run/react';

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
  const rootData = useRouteLoaderData('root');
  const {cart} = rootData;

  return (
    <>
      <BannerSection>
        <YourRecommendedPlan cart={cart}></YourRecommendedPlan>
      </BannerSection>
      <PlanReassurance
        tags={selectedTags}
        sorts={selectedSorts}
      ></PlanReassurance>
    </>
  );
}

function servings(cart) {
  return cart?.lines?.edges?.reduce((acc, line) => {
    return acc + line.node.quantity;
  }, 0);
}

function YourRecommendedPlan({cart}) {
  return (
    <div className="flex flex-wrap gap-8 md:p-8 justify-center justify-items-center items-center">
      <img
        width="400"
        height="400"
        aspect-ratio="1"
        alt="banner image"
        className="image-full"
        src="https://cdn.shopify.com/s/files/1/0271/2662/8450/files/Meals_BG.png?v=1701170483"
      />

      <div className="">
        <Suspense>
          <Await resolve={cart}>
            {(cart) => {
              const totalCost = Number(cart?.cost?.totalAmount?.amount);
              const costPerMeal = (totalCost / cart?.totalQuantity).toFixed(2);
              const discountCost =
                Number(cart?.cost?.subtotalAmount?.amount) -
                Number(cart?.cost?.totalAmount?.amount);

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
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl md:text-5xl leading-normal md:leading-relaxed font-thin text-center md:text-left">
                    <span>your </span>
                    <span id="bracketsTitle" className="font-bold">
                      personalised
                    </span>
                    <br />{' '}
                    <span>14 meal plan for only £{costPerMeal}/meal</span>
                  </h1>

                  <ul className="list-none md:list-disc md:list-inside text-lg">
                    <li className="text-center md:text-left list-item">
                      dietitian-designed, chef-made frozen meals, delivered to
                      your door
                    </li>
                    <li className="text-center md:text-left list-item">
                      personalised for your health goals
                    </li>
                    <li className="text-center md:text-left list-item">
                      2 meals a day x 7 days, or 1 meal a day x 14 days
                    </li>
                  </ul>

                  <p className="text-center hidden">
                    saving £{discountCost} when you subscribe today
                  </p>
                  <button className="btn btn-ghost hidden">
                    find out more
                  </button>
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

function PlanReassurance({tags, sorts}) {
  return (
    <section className="bg-neutral flex flex-col gap-4 align-middle justify-center items-center w-full">
      <h2 className="text-xl md:text-3xl">personalised for your health</h2>
      <div className="carousel carousel-center gap-8 p-8 space-x-2 bg-neutral  md:justify-center items-stretch  w-[99%]">
        {tags?.length === 0 && sorts?.length === 0 && (
          <CarouselItem
            tag={{
              title: 'No tags selected',
              description:
                'Please take our personalisation quiz to see personalised content',
            }}
          ></CarouselItem>
        )}
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
    <div className="carousel-item">
      <div className="card card-compact outline-2 outline outline-secondary max-w-md h-full items-center">
        <figure className="w-32 p-8">
          <img
            width="150"
            height="150"
            className=""
            src="https://cdn.shopify.com/s/files/1/0271/2662/8450/files/science.png?v=1613736536"
            alt=""
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title lowercase text-2xl font-light">
            {tag?.title}
          </h2>
          <p className=" w-44">{tag?.description}</p>
        </div>
      </div>
    </div>
  );
}
