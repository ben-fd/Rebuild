import {
  useLoaderData,
  Link,
  useFetchers,
  Outlet,
  useRouteLoaderData,
  useNavigate,
  useLocation,
  useNavigation,
  NavLink,
  useFetcher,
  useSearchParams,
} from '@remix-run/react';
import {useEffect, useState} from 'react';
import {Image, CartForm} from '@shopify/hydrogen';
import {processProductTitle} from '~/components/Cart';
import ProductModal, {loadProductDataByFetch} from '~/components/ProductModal';
import {AddIcon, MinusIcon} from '~/components/Icons';
import {DesktopCartAside, getAvailabledeliveryInfo} from '~/components/Cart';

import {getTagObjects} from '~/components/Personalisation';

import {redirect} from '@shopify/remix-oxygen';
import {
  PageContainer,
  PageContentContainer,
  PageFullBleedContainer,
} from '~/components/PageUtils';

import {dropIn} from '~/components/animations';

const collections = [
  {
    title: 'all meals',
    tag: '',
    handle: 'all',
    description: null,
    grouped: true,
  },
  {
    title: 'mediterranean',
    tag: 'diet-Mediterranean',
    handle: 'mediterranean',
    description:
      'Meals based on the Mediterranean Diet and contain extra virgin olive oil, nuts, seeds, vegetables, whole grains and legumes.',
  },
  {
    title: 'low fodmap',
    tag: 'diet-Low FODMAP',
    handle: 'low-fodmap',
    description:
      '<p>All our low FODMAP meals have been certified to be low FODMAP by the experts at Monash University.<br/>One serving of a meal made in accordance with this recipe is low in FODMAPs and can assist with following the Monash University Low FODMAP diet™️.</p>',
  },
  {
    title: 'weight management',
    tag: 'lean-lighter',
    handle: 'weight-management',
    description:
      '<400 kcal meals with less than 40g of carbohydrate, high protein, low fat, low sugar and a source of fibre to support your weight loss goals, as part of a healthy balanced lifestyle',
  },
  {title: 'gluten free', tag: 'free-gluten', handle: 'gluten-free'},
];
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

  if (!request?.url?.includes('tags') || !request?.url?.includes('sorts')) {
    return redirect('/shop?tags=&sorts=');
  }
  const searchParams = new URLSearchParams(request?.url?.split('?')[1] || '');

  const tags = searchParams?.get('tags');
  const sorts = searchParams?.get('sorts');
  const initState = searchParams?.get('init');

  const selectedTags = getTagObjects(tags?.split(',') || []);
  const selectedSorts = getTagObjects(sorts?.split(',') || []);

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

  /*

  const collectionRoute = collections?.find((coll) => {
    return coll.handle == null
      ? null
      : request.url.toLowerCase().includes(coll?.handle);
  });

  console.log('collectionRoute', collectionRoute);

  const collectionPromise = fetch(
    `https://personalisation-app-editable-b4fb26afb290.herokuapp.com/plan?tags=${
      (collectionRoute ? collectionRoute?.tag + ',' : '') + tags
    }&sorts=${sorts}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );

  collection.products.nodes = await collectionPromise
    .then((res) => res.json())
    .then((data) => {
      return data?.sortedProducts;
    });
    */

  //
  const collectionResponse = await getCollectionRoute(request.url, collection);

  collection = collectionResponse.collection;

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

    const result = await cart.create({
      lines: lines,
      discountCodes: ['PERSONALISEDPLAN20'],
    });

    const cartResult = result.cart;

    // Update cart id in cookie
    const headers = cart.setCartId(cartResult.id);

    const newUrl = new URL(request.url);
    newUrl.searchParams.delete('init');

    return redirect(newUrl, {
      headers: headers,
    });
  }

  const currentUrl = new URL(request.url);
  const handleInUrl = currentUrl.searchParams.get('productModal');
  const productModal = await loadProductDataByFetch(handleInUrl, storefront);

  if (productModal) {
    const productModalId = productModal?.product?.id.replace(
      'gid://shopify/Product/',
      '',
    );

    productModal.product.variants =
      collection?.products?.nodes?.find((collProduct) => {
        return collProduct.id.toString().includes(productModalId);
      })?.variants || [];
  }

  if (!request?.url.includes('offer') && collection?.grouped) {
    let grouped = collection.products.nodes.reduce((acc, product) => {
      const product_type = product?.product_type;
      // reduce the products into an object with the product type as the key
      acc[product_type] = acc[product_type] || [];
      acc[product_type].push(product);
      return acc;
    }, {});

    collection.products.groups = Object.keys(grouped).map((key) => {
      return {
        title: key,
        products: grouped[key],
      };
    });
  }

  return {
    cart: cart.get(),
    collection,
    collections,
    context,
    productModal,
    cartLines: cartLines?.lines?.nodes,
    selectedSorts,
    selectedTags,
  };
}

async function getCollectionRoute(requestUrl, collection) {
  const collectionRoute =
    collections?.find((coll) => {
      return coll.handle == null
        ? null
        : requestUrl.toLowerCase().includes(coll?.handle);
    }) || collections[0];

  const searchParams = new URLSearchParams(requestUrl.split('?')[1]);
  const tags = searchParams.get('tags');
  const sorts = searchParams.get('sorts');

  const collectionPromise = await fetch(
    `https://personalisation-app-editable-b4fb26afb290.herokuapp.com/plan?tags=${
      (collectionRoute ? collectionRoute?.tag + ',' : '') + tags
    }&sorts=${sorts}`,
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
      return data?.sortedProducts;
    });

  collection.products.nodes = collectionPromise;
  collection.title = collectionRoute?.title;
  collection.description = collectionRoute?.description;
  collection.grouped = collectionRoute?.grouped || false;

  return {
    collection,
  };
}

function CollectionsMenu({collections}) {
  const location = useLocation();
  return (
    <div
      className={
        location.pathname.includes('offer')
          ? 'hidden'
          : 'carousel carousel-center space-x-4 w-full p-4 rounded-full outline outline-1 outline-secondary'
      }
    >
      {collections?.map((collection) => {
        return (
          <div key={'link' + collection?.handle} className="carousel-item">
            <CollectionsLink collection={collection}></CollectionsLink>
          </div>
        );
      })}
    </div>
  );
}

function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

function CollectionsLink({collection}) {
  const location = useLocation();
  return (
    <NavLink
      reloadDocument
      style={activeLinkStyle}
      to={'/shop/' + collection?.handle + '?tags=&sorts='}
      className={'link link-hover'}
    >
      {collection?.title}
    </NavLink>
  );
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
    productModal,
    cartLines,
    selectedSorts,
    selectedTags,
    collections,
  } = useLoaderData();

  const rootData = useRouteLoaderData('root');
  const {cart, deliveryInfo} = rootData;

  const location = useLocation();

  const [editable, setEditable] = useState(
    location.pathname?.includes('offer') ? false : true,
  );

  const [selectedCollection, setSelectedCollection] = useState(collection);

  useEffect(() => {
    if (location.pathname?.includes('offer')) {
      setEditable(false);
    } else {
      setEditable(true);
    }
  }, [location]);

  useEffect(() => {
    productModal?.product != null
      ? document.getElementById('product_modal').showModal()
      : document.getElementById('product_modal').close();
  }, [productModal]);

  return (
    <>
      <ProductModal product={productModal?.product || null} />
      {/* This outlet serves the collection header logic */}
      <Outlet />
      <PageContainer>
        <div className="lg:grid lg:grid-cols-4">
          <PageContentContainer>
            <CollectionsMenu collections={collections}></CollectionsMenu>
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-3xl font-light">
                {selectedCollection?.title}
              </h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedCollection?.description,
                }}
              ></div>
            </div>
            <h3
              className={selectedTags != '' ? 'text-xl text-center' : 'hidden'}
            >
              perfect for you
            </h3>
            <div id="mainGrid" className="">
              <ProductsGrid
                editable={editable}
                products={perfectForYou(selectedCollection?.products.nodes)}
                cartLines={cartLines}
                selectedTags={selectedTags}
                selectedSorts={selectedSorts}
              />
            </div>
            {editable && (collection?.tag == '' || !collection?.tag) && (
              <>
                <h3 className="text-xl text-center">our other meals</h3>
                <div className="">
                  <ProductsGrid
                    editable={editable}
                    products={otherMeals(selectedCollection?.products.nodes)}
                    cartLines={cartLines}
                    selectedTags={selectedTags}
                    selectedSorts={selectedSorts}
                  />
                </div>
              </>
            )}
          </PageContentContainer>

          <DesktopCartAside cart={cart} deliveryInfo={deliveryInfo} />
        </div>
      </PageContainer>
      <PageFullBleedContainer>
        <h2 className="text-3xl font-light">FAQs</h2>

        <div className="max-w-xl w-full flex flex-col gap-2 p-8">
          <div className="collapse collapse-arrow bg-white">
            <input
              type="radio"
              name="my-accordion-2"
              defaultChecked="checked"
            />
            <div className="collapse-title text-xl">
              Click to open this one and close others
            </div>
            <div className="collapse-content">
              <p>hello</p>
            </div>
          </div>
          <div className="collapse collapse-arrow bg-white ">
            <input type="radio" name="my-accordion-2" />
            <div className="collapse-title text-xl">
              Click to open this one and close others
            </div>
            <div className="collapse-content">
              <p>hello</p>
            </div>
          </div>
          <div className="collapse collapse-arrow bg-white">
            <input type="radio" name="my-accordion-2" />
            <div className="collapse-title text-xl">
              Click to open this one and close others
            </div>
            <div className="collapse-content">
              <p>hello</p>
            </div>
          </div>
        </div>
      </PageFullBleedContainer>
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
    <div className="grid md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-8">
      {products.map((product, index) => {
        return (
          <ProductItem
            key={product.id}
            cartLines={cartLines}
            selectedTags={selectedTags}
            selectedSorts={selectedSorts}
            editable={editable}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        );
      })}
      <EditCard editable={editable} products={products}></EditCard>
    </div>
  );
}

function EditCard({editable, products}) {
  const navigate = useNavigate();
  return (
    <div
      className={editable ? 'hidden' : 'card card-compact card-bordered glass'}
    >
      <div className="card-body">
        <h2 className="text-xl">want to edit your selection?</h2>
        <p>
          choose from <strong>{products?.length} meals</strong> matching your
          health goals, plus many more.
        </p>
        <button
          className="btn btn-block btn-secondary text-xl font-light"
          onClick={() => {
            const newUrl = new URL(window.location.href);
            navigate(newUrl.pathname.replace('/offer', '') + newUrl.search);
          }}
        >
          edit meals
        </button>
      </div>
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
  cartLines,
}) {
  //const variant = product.variants[0];
  const variantUrl = ''; //useVariantUrl(product.handle, variant.selectedOptions);

  const [inBasket, setInBasket] = useState(
    product?.variants?.find((variant) => {
      return variant?.quantity > 0;
    }),
  );
  const [quantityInBasket, setQuantityInBasket] = useState(
    product?.variants?.reduce((total, variant) => {
      return total + (variant?.quantity || 0);
    }, 0),
  );

  useEffect(() => {
    const thisLineInCart = cartLines?.find((line) => {
      return line?.merchandise?.product.id.includes(product?.id);
    }) || {quantity: 0};
    setQuantityInBasket(thisLineInCart?.quantity);
    setInBasket(thisLineInCart?.quantity > 0);
  }, [cartLines]);

  const [badges, setBadges] = useState([]);

  //loop tags and assign

  useEffect(() => {
    const badges_ = [];
    selectedTags?.forEach((tag) => {
      tag?.hide
        ? null
        : product.matchedTags?.includes(tag?.tag)
        ? badges_.push({title: tag?.title, has: true})
        : tag.not_rule
        ? badges_.push({title: 'not ' + tag?.title, has: false})
        : null;
    });
    selectedSorts?.forEach((sort) => {
      sort?.hide
        ? null
        : product.matchedSorts?.includes(sort?.tag)
        ? badges_.push({title: sort?.title, has: true})
        : sort.not_rule
        ? badges_.push({title: 'not ' + sort?.title, has: false})
        : null;
    });
    setBadges(badges_);
  }, []);

  const hasAvailableVariants = product?.variants?.find((variant) => {
    return variant?.available;
  });

  const location = useLocation();
  const modalLink =
    location.pathname + location.search + '&productModal=' + product?.handle;

  return (
    <>
      <div
        className={
          (inBasket ? 'outline outline-3 outline-accent' : '') +
          ' card card-compact bg-white shadow-lg ' +
          (!editable && !inBasket ? 'hidden' : '')
        }
        key={'gid://shopify/Product/' + product.id}
      >
        <div className="indicator w-full">
          {inBasket ? (
            <span className="indicator-item indicator-center badge badge-accent">
              in basket
            </span>
          ) : null}
          {hasAvailableVariants ? null : (
            <span className="indicator-item indicator-center badge badge-neutral">
              out of stock
            </span>
          )}
          {product.image && (
            <Link
              className=""
              preventScrollReset={true}
              prefetch="none"
              to={modalLink}
            >
              <Image
                className={'card'}
                alt={product.title}
                aspectRatio="1/1"
                src={product.image}
                loading={loading}
                width="400px"
                sizes="400px"
              />
            </Link>
          )}
        </div>
        <div className="card-body">
          <Link
            className=""
            preventScrollReset={true}
            prefetch="viewport"
            to={modalLink}
          >
            <h3 className="font-light lowercase text-lg h-14">
              {processProductTitle(product.title)}
            </h3>
            <input
              type="hidden"
              id={product.handle}
              name="handle"
              value={product.handle}
            />
          </Link>
          {badges?.map((badge) => {
            if (badge?.title.includes('Calorie')) {
              return (
                <span className="badge badge-neutral">
                  {product?.calories} kcal
                </span>
              );
            }
          })}
          <span className="badge badge-neutral hidden">
            {product.carbs}g carbs
          </span>
          <div className="flex  w-full flex-wrap gap-2 ">
            {badges?.map((badge) => {
              return (
                <div
                  key={product?.id + badge?.title || 'none'}
                  className={
                    !badge.has ? 'negative tag-pill' : 'positive tag-pill'
                  }
                >
                  <span className="text-md lowercase">{badge?.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <ProductAddOrChangeButton
          modalLink={modalLink}
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

function ProductAddOrChangeButton({
  product,
  inBasket,
  editable,
  disabled,
  modalLink,
}) {
  const lowestVariantPrice = product?.variants?.reduce((lowest, variant) => {
    return Math.min(lowest, variant.price);
  }, Infinity);

  return inBasket ? (
    <div className={editable ? 'card-body justify-end' : 'hidden'}>
      <Link
        to={modalLink}
        preventScrollReset={true}
        prefetch="none"
        className={
          (disabled ? 'btn-disabled' : '') +
          ' btn btn-neutral shadow-sm btn-outline btn-block text-xl font-light'
        }
      >
        change
      </Link>
    </div>
  ) : (
    <div
      className={
        editable ? 'card-body flex flex-row items-end justify-end' : 'hidden'
      }
    >
      <div className="flex items-center justify-between w-full gap-1">
        <span className="font-light">from £{lowestVariantPrice}</span>
        <Link
          to={modalLink}
          preventScrollReset={true}
          prefetch="none"
          className={
            (disabled ? 'btn-disabled' : '') +
            ' btn btn-primary shadow-sm text-xl font-light'
          }
        >
          {disabled ? 'out of stock' : 'add'}
        </Link>
      </div>
    </div>
  );
}
/* legacy */
export function ProductAddButtons({product, variants}) {
  return (
    <div className="flex flex-col gap-2">
      {variants.map((variant) => {
        return (
          <div
            key={variant.id + 'addBtn'}
            className="flex flex-row gap-2 w-full justify-between  align-middle items-center"
          >
            <span className="lowercase text-md">
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

/* legacy */
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
              (submittingAddToCart ? 'btn-disabled ' : ' ') +
              'btn btn-primary rounded-btn  w-20 flex flex-row justify-center align-middle items-center flex-nowrap'
            }
          >
            <span className={'text-xl font-light'}>
              {submittingAddToCart ? 'adding' : 'add'}
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
              className="btn text-lg btn-secondary font-light btn-circle  flex items-center disabled:opacity-50 hover:bg-secondary"
              onClick={() => handleQuantityChange('decrement')}
            >
              <MinusIcon size={'1.5em'} />
            </button>
            <p className="font-light text-xl p-2">{quantity}</p>
            <button
              className="btn text-lg btn-secondary font-light  btn-circle flex items-center disabled:opacity-50"
              onClick={() => handleQuantityChange('increment')}
            >
              <AddIcon size={'2em'} />
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
