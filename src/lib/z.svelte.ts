// Schema is imported from wherever your Schema type lives.
// via export type Schema = typeof schema;

import { Z } from 'zero-svelte';
import { config } from './config';
import { schema, type Schema } from '../schema';

// const zeroAtom = new Atom<Zero<Schema>>();
// const authAtom = new Atom<LoginState>();
// const jwt = getJwt();
// const encodedJwt = getRawJwt();

// authAtom.value =
//   encodedJwt && jwt
//     ? {
//         encoded: encodedJwt,
//         decoded: jwt as LoginState['decoded'],
//       }
//     : undefined;

// authAtom.onChange(auth => {
//   zeroAtom.value?.close();
//   mark('creating new zero');
//   const z = new Zero({
//     logLevel: 'info',
//     server: import.meta.env.VITE_PUBLIC_SERVER,
//     userID: auth?.decoded?.sub ?? 'anon',
//     auth: (error?: 'invalid-token') => {
//       if (error === 'invalid-token') {
//         clearJwt();
//         authAtom.value = undefined;
//         return undefined;
//       }
//       return auth?.encoded;
//     },
//     schema,
//   });
//   zeroAtom.value = z;

//   exposeDevHooks(z);
// });

export const z = new Z<Schema>({
	server: config.vitePublicServer,
	schema,
	userID: 'anon'
});
