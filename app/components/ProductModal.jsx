import {useRouteLoaderData, useNavigate} from '@remix-run/react';
import {loadRouteModule} from '@remix-run/react/dist/routeModules';
import React, {useState, useEffect} from 'react';
import {loader as productLoader} from '../routes/products.$handle';
import {CloseIcon} from '../components/Icons';
import {Image, CartForm} from '@shopify/hydrogen';
import {ProductImage} from '../routes/products.$handle';
import {PRODUCT_QUERY} from '../routes/products.$handle';

const ProductModal = ({product, quantity}) => {
  const navigate = useNavigate();

  function handleModalClose() {
    // remove productModal from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('productModal');
    navigate(url.pathname + url.search, {preventScrollReset: true});
  }

  return (
    <dialog
      id="product_modal"
      className={product == null ? 'hidden' : 'modal'}
      onClose={handleModalClose}
    >
      <form method="dialog" className="modal-backdrop">
        <button className="w-screen"></button>
      </form>
      <div className="modal-box card lg:card-side bg-base-100 shadow-xl grid grid-cols-2 max-w-4xl p-0">
        <figure className="w-105 col-span-1">
          <ProductImage
            image={product?.variants?.nodes[0]?.image}
            sizes={'300px'}
          />
        </figure>
        <div className="card-body max-w-lg col-span-1">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              <CloseIcon size={'2em'} />
            </button>
          </form>
          <div className="grid grid-rows-2">
            <div className=" row-span-1">
              <div className="margin-auto">
                {product ? (
                  <div className="card card-compact outline outline-2 outline-neutral bg-white">
                    <div className="card-body text-center lowercase">
                      <h2 className="text-2xl text-center lowercase">
                        {product?.title}
                      </h2>

                      <p>{product?.description}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2>404</h2>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button className="w-screen"></button>
      </form>
    </dialog>
  );
};

export async function loadProductDataByFetch(handle, storefront) {
  const selectedOptions = [];

  const selectedProductHandle = handle;

  let product = null;
  if (selectedProductHandle) {
    product = await storefront.query(PRODUCT_QUERY, {
      variables: {handle: selectedProductHandle, selectedOptions},
    });
    console.log(product);
  }
  return product;
}

export default ProductModal;
