/** Transform .hgs imports at build time. Place before the React or Vue plugin. */
export default function hangulscript(): {
  name: string;
  enforce: 'pre';
  transform(source: string, id: string): { code: string; map: null } | null;
};
