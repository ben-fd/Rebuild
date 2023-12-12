import {useEffect} from 'react';
import {annotate} from 'rough-notation';
import {Script} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';

export function BannerSection({children}) {
  return (
    <section className=" bg-cover bg-hero-texture bg-no-repeat w-full">
      <div className="p-8">{children}</div>
    </section>
  );
}

export function HeadingStacked({children}) {
  return (
    <h1 className="text-4xl md:text-5xl leading-normal md:leading-relaxed font-thin text-center md:text-left">
      {children}
    </h1>
  );
}

export function PinkHighlight({children}) {
  const id = children.toLowerCase().replace(' ', '-');
  useEffect(() => {
    const highlight = document.getElementById(id);
    const annotation = annotate(highlight, {
      type: 'highlight',
      color: '#FDC9CB4d',
      strokeWidth: 2,
    });
    annotation.show();
  }, []);

  return (
    <span id={id} className="font-bold">
      {children}
    </span>
  );
}

export function PageContainer({children, colour = ''}) {
  return (
    <section
      className={
        colour +
        'flex flex-col justify-center items-center py-0 max-w-[1690px]  m-auto'
      }
    >
      {children}
    </section>
  );
}

export function PageContentContainer({children}) {
  return (
    <div
      className={
        'w-screen md:w-full flex flex-col justify-center align-middle items-center gap-4 p-8 max-w-[1690px] lg:col-span-3'
      }
    >
      {children}
    </div>
  );
}

export function PageFullBleedContainer({children, colour = 'bg-neutral'}) {
  return (
    <section
      className={
        colour +
        ' flex flex-col gap-4 align-middle justify-center items-center w-full'
      }
    >
      {children}
    </section>
  );
}

export function AtomLottie() {
  return (
    <div className=" w-32 h-32">
      <Script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.js" />
      <dotlottie-player
        src="https://lottie.host/5b9d1e9a-99d5-45eb-8fad-8ce2983dbe22/vTiH37oclQ.lottie"
        background="transparent"
        speed="1"
        direction="1"
        intermission="500"
        autoplay
        mode="normal"
        loop
      ></dotlottie-player>
    </div>
  );
}

/* buttons */
export function MainButtonLink({children, url, prefetch}) {
  return (
    <Link
      to={url || ''}
      prefetch={prefetch || false}
      className="btn btn-primary btn-block text-xl font-light"
      reloadDocument
    >
      {children}
    </Link>
  );
}

export function OutlineButtonLink({children, url, prefetch}) {
  return (
    <Link
      to={url || ''}
      prefetch={prefetch || false}
      reloadDocument
      className="btn  btn-outline btn-block text-xl font-light"
    >
      {children}
    </Link>
  );
}
