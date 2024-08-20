export const imageBufferEncoding: BufferEncoding = "base64";

export const entryPoints = {
  baseUrl: "/",
  photoBase: "/photo",
  photo: {
    getImage: "/:id/image",
    getMetadata: "/:id/metadata",
    add: "/",
    replace: "/",
    delete: "/:id",
  },
};
