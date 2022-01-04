import cloudinary from 'cloudinary'

cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
	secure: true,
})

const CloudinaryClient = cloudinary.v2
export default CloudinaryClient