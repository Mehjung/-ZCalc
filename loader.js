export async function loader(modules) {
  const { default: alpinejs } = await import(
    "https://cdn.skypack.dev/alpinejs"
  );
  console.debug("Alpine", alpinejs.version);
  let promises = modules.map((mod) => import(mod));
  return Promise.all(promises).then((values) => {
    values.forEach((module) => {
      Object.keys(module).forEach((attr) => {
        let data = module[attr]();
        alpinejs.data(attr, () => data);
      });
    });
    alpinejs.start();
  });
}
