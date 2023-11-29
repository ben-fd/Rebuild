import {
  useLoaderData,
  Link,
  useFetcher,
  Await,
  useFetchers,
  Outlet,
  useRouteLoaderData,
} from '@remix-run/react';
import {Suspense, useEffect, useState} from 'react';
import {Image, Money, CartForm} from '@shopify/hydrogen';
import {processProductTitle} from '~/components/Cart';
import ProductModal, {loadProductDataByFetch} from '~/components/ProductModal';
import {PRODUCT_QUERY} from './products.$handle';
import {AddIcon, MinusIcon} from '~/components/Icons';
import {DesktopCartAside, getAvailabledeliveryInfo} from '~/components/Cart';

import {getTagObjects} from '~/components/Personalisation';

import {redirect} from '@shopify/remix-oxygen';
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
  const {storefront, cart} = context;

  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const tags = searchParams?.get('tags');
  const sorts = searchParams?.get('sorts');
  const initState = searchParams?.get('init');
  const editable = searchParams?.get('offer') === 'true' ? false : true;

  const selectedTags = getTagObjects(tags.split(',') || []);
  const selectedSorts = getTagObjects(sorts.split(',') || []);

  let collection = {
    id: 'gid://shopify/Collection/157328244834',
    handle: 'shop',
    title: 'personalised plan',
    tags: tags || '',
    sorts: sorts || '',
    description: '',
    products: {
      nodes: [],
    },
  };

  await fetch(
    `https://personalisation-app-editable-b4fb26afb290.herokuapp.com/plan?tags=${tags}&sorts=${sorts}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  )
    .then((res) => res.json())
    .then((data) => {
      collection.products.nodes = data?.sortedProducts;
    });

  const cartLines = await cart.get();

  //loop the cart lines on the server. If found, map the quantity to the variant
  cartLines?.lines?.nodes.map((line) => {
    collection?.products?.nodes.map((product) => {
      line?.merchandise?.product.id.includes(product?.id)
        ? product?.variants?.map((variant) => {
            if (line?.merchandise?.id.includes(variant?.id)) {
              variant.quantity = line?.quantity;
              variant.lineId = line?.id;
            }
          })
        : null;
    });
  });

  //if init state, then add the first 14 products to the basket
  if (initState) {
    const availableProducts = filterUnavailableVariants(
      perfectForYou(collection.products.nodes),
      '1 Person',
    );

    const lines = [];
    //loop through the first 14 products and add them to the cart. If there is less than 14 products available, then add additional products to make up the 14
    for (let i = 0; i < 14; i++) {
      const product = availableProducts[i % availableProducts.length];
      const variant = product?.variants?.find((variant) => {
        return variant?.title === '1 Person';
      });
      const lineVariantId = `gid://shopify/ProductVariant/${variant?.id}`;

      if (lines.find((line) => line.merchandiseId === lineVariantId)) {
        lines.find((line) => line.merchandiseId === lineVariantId).quantity++;
      } else {
        lines.push({
          merchandiseId: lineVariantId,
          quantity: 1,
        });
      }
    }

    //console.log(lines);

    const result = await cart.create({
      lines: lines,
      discountCodes: ['PERSONALISEDPLAN20'],
    });

    const cartResult = result.cart;

    // Update cart id in cookie
    const headers = cart.setCartId(cartResult.id);

    const newUrl = new URL(request.url);
    newUrl.searchParams.delete('init');
    newUrl.searchParams.set('offer', 'true');

    return redirect(newUrl, {
      headers: headers,
    });
  }

  return {
    cart: cart.get(),
    editable,
    collection,
    context,
    cartLines: cartLines?.lines?.nodes,
    selectedSorts,
    selectedTags,
  };
}

function perfectForYou(nodes) {
  return nodes.filter((product) => {
    return (
      product.typeInclude && product.include && product.status === 'active'
    );
  });
}

function filterUnavailableVariants(nodes, variantTitle) {
  return nodes.filter((product) => {
    return (
      product.typeInclude &&
      product.include &&
      product.status === 'active' &&
      product?.variants?.find((variant) => {
        return variant?.title === variantTitle;
      })?.available
    );
  });
}

function otherMeals(nodes) {
  return nodes.filter((product) => {
    return (
      product.typeInclude && !product.include && product.status === 'active'
    );
  });
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {
    collection,
    context,
    cartLines,
    editable,
    selectedSorts,
    selectedTags,
  } = useLoaderData();
  const rootData = useRouteLoaderData('root');
  const {cart, deliveryInfo} = rootData;

  const product = null;

  return (
    <>
      <Suspense fallback={<></>}>
        <Await resolve={product}>
          <ProductModal product={product || null} />
        </Await>
      </Suspense>
      {/* This outlet serves the collection header logic */}
      <Outlet />
      <section className="flex justify-center py-0 max-w-[1690px]  m-auto">
        <div className="lg:grid lg:grid-cols-4">
          <div className="flex flex-col justify-center align-middle items-center gap-8 p-8 max-w-[1690px] lg:col-span-3">
            <h2 className="lowercase text-xl md:text-3xl font-sans hidden">
              choose your meals
            </h2>
            <h3 className="text-lg text-center hidden">perfect for you</h3>

            <div className="">
              <ProductsGrid
                editable={editable}
                products={perfectForYou(collection.products.nodes)}
                cartLines={cartLines}
                selectedTags={selectedTags}
                selectedSorts={selectedSorts}
              />
            </div>
            <h3 className="text-lg text-center hidden">our other meals</h3>
            <div className="">
              <ProductsGrid
                products={otherMeals(collection.products.nodes)}
                cartLines={cartLines}
              />
            </div>
          </div>

          <DesktopCartAside cart={cart} deliveryInfo={deliveryInfo} />
        </div>
      </section>
    </>
  );
}

export async function action({request, context}) {
  return null;
}

/**
 * @param {{products: ProductItemFragment[]}}
 */
function ProductsGrid({
  products,
  cartLines,
  editable,
  selectedTags,
  selectedSorts,
}) {
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product, index) => {
        return (
          <ProductItem
            key={product.id}
            selectedTags={selectedTags}
            selectedSorts={selectedSorts}
            editable={editable}
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
function ProductItem({
  product,
  loading,
  editable,
  selectedTags,
  selectedSorts,
}) {
  //const variant = product.variants[0];
  const variantUrl = ''; //useVariantUrl(product.handle, variant.selectedOptions);
  const fetcher = useFetcher();

  const inBasket = product?.variants?.find((variant) => {
    return variant?.quantity > 0;
  });

  const quantityInBasket = product?.variants?.reduce((total, variant) => {
    return total + (variant?.quantity || 0);
  }, 0);

  const badges = [];
  product?.matchedTags?.map((tag) => {
    const tagForBadge = selectedTags?.find((selectedTag) => {
      return selectedTag?.tag === tag;
    });
    tagForBadge?.hide || tagForBadge == undefined
      ? null
      : badges.push(tagForBadge?.title);
  });
  product?.matchedSorts?.map((sort) => {
    const sortForBadge = selectedSorts?.find((selectedSort) => {
      return selectedSort?.tag === sort;
    });

    sortForBadge?.hide || sortForBadge == undefined
      ? null
      : badges.push(sortForBadge?.title);
  });

  const hasAvailableVariants = product?.variants?.find((variant) => {
    return variant?.available;
  });

  return (
    <>
      <div
        className={
          (inBasket ? 'outline outline-3 outline-accent' : '') +
          ' card card-compact bg-white shadow-lg ' +
          (!editable && !inBasket ? 'hidden' : '')
        }
        key={'gid://shopify/Product/' + product.id}
        prefetch="intent"
        to={variantUrl}
      >
        <div className="indicator w-full">
          {inBasket ? (
            <span className="indicator-item indicator-center badge badge-accent">
              {quantityInBasket} in basket
            </span>
          ) : null}
          {hasAvailableVariants ? null : (
            <span className="indicator-item indicator-center badge badge-neutral">
              out of stock
            </span>
          )}
          {product.image && (
            <Image
              className={'card'}
              alt={product.title}
              aspectRatio="1/1"
              src={product.image}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
            />
          )}
        </div>
        <div className="card-body">
          <Link
            className=""
            prefetch="viewport"
            to={`/products/${product.handle}`}
          >
            <h3 className=" font-light lowercase text-lg">
              {processProductTitle(product.title)}
            </h3>
            <input type="hidden" name="tags" value={''} />
            <input type="hidden" name="sorts" value={''} />
            <input
              type="hidden"
              id={product.handle}
              name="handle"
              value={product.handle}
            />
          </Link>
          <span className="badge badge-neutral">{product.calories} kcal</span>
          <span className="badge badge-neutral hidden">
            {product.carbs}g carbs
          </span>
          <div className="flex  w-full flex-wrap gap-2 ">
            {badges?.map((badge) => {
              return (
                <div
                  key={product?.id + badge || 'none'}
                  className={'tag-pill positive'}
                >
                  <span className="text-md lowercase">{badge}</span>
                </div>
              );
            })}
          </div>
        </div>

        <ProductAddOrChangeButton
          product={product}
          inBasket={inBasket}
          editable={editable}
          disabled={!hasAvailableVariants}
        />

        {/* <ProductAddButtons product={product} variants={product?.variants} />*/}
      </div>
    </>
  );
}

function ProductAddOrChangeButton({product, inBasket, editable, disabled}) {
  const lowestVariantPrice = product?.variants?.reduce((lowest, variant) => {
    return Math.min(lowest, variant.price);
  }, Infinity);

  return inBasket ? (
    <div className={editable ? 'card-body justify-end' : 'hidden'}>
      <button className="btn btn-neutral shadow-sm btn-outline btn-block text-xl font-light">
        change{' '}
      </button>
    </div>
  ) : (
    <div
      className={
        editable ? 'card-body flex flex-row items-end justify-end' : 'hidden'
      }
    >
      <div className="flex items-center justify-between w-full gap-1">
        <span className="font-light">from £{lowestVariantPrice}</span>
        <button
          className={
            (disabled ? 'btn-disabled' : '') +
            ' btn btn-primary shadow-sm text-xl font-light'
          }
        >
          {disabled ? 'out of stock' : 'add'}
        </button>
      </div>
    </div>
  );
}

function ProductAddButtons({product, variants}) {
  return (
    <div className="p-4 flex flex-col gap-2">
      {variants?.map((variant) => {
        return (
          <div
            key={variant.id + 'addBtn'}
            className="flex flex-row gap-2 w-full justify-between  align-middle items-center"
          >
            <span className="text-xs">
              {variant.title} - £{variant?.price}
            </span>
            <VariantAddButton
              key={variant.id}
              variant={variant}
            ></VariantAddButton>
          </div>
        );
      })}
    </div>
  );
}

function VariantAddButton({variant}) {
  const [quantity, setQuantity] = useState(variant?.quantity || 0);

  const fetchers = useFetchers();

  let submittingAddToCart;
  const fetcherLoop = fetchers
    .find((fetcher) => {
      return fetcher.formAction === '/cart';
    })
    ?.formData.forEach((data) => {
      if (data.includes(variant?.id)) {
        submittingAddToCart = true;
      }
    });

  useEffect(() => {
    setQuantity(variant?.quantity);
  }, [variant]);

  function handleQuantityChange(modifier) {
    //submit the cart form
    switch (modifier) {
      case 'increment':
        setQuantity(quantity + 1);
        break;
      case 'decrement':
        setQuantity(quantity - 1);
        break;
      default:
        break;
    }
  }
  return (
    <>
      <div className={quantity > 0 ? 'hidden' : ''}>
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesAdd}
          method="post"
          inputs={{
            lines: [
              {
                merchandiseId: `gid://shopify/ProductVariant/${variant?.id}`,
                quantity: 1,
              },
            ],
          }}
        >
          <button
            type="submit"
            className={
              'btn btn-primary btn-sm rounded-btn  w-20 flex flex-row justify-center align-middle items-center flex-nowrap'
            }
          >
            <span
              className={
                submittingAddToCart
                  ? 'flex flex-col items-center align-middle justify-center'
                  : 'hidden'
              }
            ></span>
            <span
              className={submittingAddToCart ? 'hidden' : 'text-xl font-light'}
            >
              add
            </span>
          </button>
        </CartForm>
      </div>

      <div className={quantity > 0 ? '' : 'hidden'}>
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesUpdate}
          method="post"
          inputs={{
            lines: [
              {
                id: `${variant?.lineId}`,
                quantity: quantity,
              },
            ],
          }}
        >
          <div className="flex justify-between  align-middle  items-center">
            <button
              className="btn btn-outline btn-xs text-lg btn-ghost font-light rounded-btn flex items-center disabled:opacity-50 hover:bg-secondary"
              onClick={() => handleQuantityChange('decrement')}
            >
              <MinusIcon size={'1.2em'} />
            </button>
            <p className="font-light text-xl p-2">{quantity}</p>
            <button
              className="btn btn-outline btn-xs text-lg btn-ghost font-light rounded-btn flex items-center disabled:opacity-50 hover:bg-secondary"
              onClick={() => handleQuantityChange('increment')}
            >
              <AddIcon size={'1.2em'} />
            </button>
          </div>
        </CartForm>
      </div>
    </>
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
