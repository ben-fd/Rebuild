import {json, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {
  Pagination,
  getPaginationVariables,
  Image,
  Money,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/utils';
import { processProductTitle } from '~/components/Cart';
import Cart from './cart';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, params, context}) {
  const {storefront} = context;
  
  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const tags = searchParams.get('tags');
  const sorts = searchParams.get('sorts');
  let collection = {
    "id": "gid://shopify/Collection/157328244834",
    "handle": "shop",
    "title": "personalised plan",
    "description": "",
    "products": {
      "nodes":[]
    }
  }
      
   await fetch(`https://personalisation-app-editable-b4fb26afb290.herokuapp.com/plan?tags=${tags}&sorts=${sorts}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
  }).then(res => res.json()).then(data => {
    collection.products.nodes = data?.sortedProducts;
  })

  return {collection};
}

function perfectForYou(nodes){
  return nodes.filter((product)=> {return product.typeInclude && product.include && product.status === "active"})
}

function otherMeals(nodes){
  return nodes.filter((product)=> {return product.typeInclude && !product.include && product.status === "active"})
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();

  return (
    <div className="flex flex-col justify-center align-middle items-center gap-4">
      <h1 className="lowercase text-3xl font-sans">{collection.title}</h1>
      <p className="collection-description">{collection.description}</p>
      <h2 className="text-xl text-center">perfect for you</h2>
      <div className="">
        <ProductsGrid products={perfectForYou(collection.products.nodes)} />
      </div>
      <h2 className="text-xl text-center">our other meals</h2>
      <div className="">
        <ProductsGrid products={otherMeals(collection.products.nodes)} />
      </div>
    </div>
  );
}

/**
 * @param {{products: ProductItemFragment[]}}
 */
function ProductsGrid({products}) {
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product, index) => {
        return (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        );
      })}
    </div>
  );
}

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading}) {
  const variant = product.variants[0];
  const variantUrl = ""; //useVariantUrl(product.handle, variant.selectedOptions);
  return (
    
    <Link
      className="card card-compact bg-white shadow-md"
      key={"gid://shopify/Product/"+product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="">
      <div className="indicator w-full ">
        <span className="indicator-item indicator-end badge badge-neutral">1</span>
          {product.image && (
          <figure className="w-fit">
              <Image
            alt={product.title}
            aspectRatio="1/1"
            src={product.image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
          </figure>    
        )}
      </div>
      </div>
     
      <div className="card-body">
      
      <h4 className="card-title font-light lowercase">{product.title /*processProductTitle(product.title)*/}</h4>
      <span className="badge badge-neutral">{product.calories} kcal</span><span className="badge badge-neutral">{product.carbs}g carbs</span>
      {/*<small>
        <Money data={product.priceRange.minVariantPrice} />
     </small>*/}
      </div>

      
    </Link>

  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 1) {
      nodes {
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
