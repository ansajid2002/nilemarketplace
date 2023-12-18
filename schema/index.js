import * as Yup from "yup"

export const productformsSchema = Yup.object({
    // ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),                             

    // locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    // locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    // locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    // description: Yup.string().min(2).required("Please enter description"),
    // images: Yup.array()
    // .min(1, 'At least one image is required')
    // .required('At least one image is required'),

    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),


    // currency_symbol: Yup.string()
    //     .required('Currency symbol is required')
    //     .oneOf(["USD","EUR","SOS","ETB","KES"], 'Invalid currency symbol selected'),



    brand: Yup.string().min(2).max(25).required("Please enter Brand"),
    material: Yup.string().min(2).max(25).required("Please enter Material"),

    style: Yup.string().min(2).max(25).required("Please enter Style"),
    fueltype: Yup.string().min(2).max(25).required("Please enter Fuel type"),
    model: Yup.string().min(2).max(25).required("Please enter Model Name and Year"),
    packagingtype: Yup.string().min(2).max(25).required("Please enter packaging type"),
    typeofbeverage: Yup.string().min(2).max(25).required("Please enter Type of Beverage"),
    publisher: Yup.string().min(2).max(25).required("Please enter name of  publisher"),
    genre: Yup.string().min(2).max(25).required("Please enter Genre"),
    typeofcycle: Yup.string().min(2).max(25).required("Please enter Type of Cycle"),
    product: Yup.string().min(2).max(25).required("Please enter Type of Product"),
    typeofsupplies: Yup.string().min(2).max(25).required("Please enter Type of Supplies"),
})


export const electronicSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),

    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),
    // images: Yup.array()
    // .min(1, 'AT LEAST ONE IMAGE is required')
    // .required('AT LEAST ONE IMAGE is required'),


    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})

export const FashionSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    material: Yup.string().min(2).max(25).required("Please enter Material"),
    style: Yup.string().min(2).max(25).required("Please enter Style"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),
})

export const jewelrySchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    material: Yup.string().min(2).max(25).required("Please enter Material"),
    style: Yup.string().min(2).max(25).required("Please enter Style"),
    brand: Yup.string().min(2).max(25).required("Please enter Brand"),
})

export const homegardenSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    material: Yup.string().min(2).max(25).required("Please enter Material"),
    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})

export const healthbeautySchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    product: Yup.string().min(2).max(25).required("Please enter Type of Product"),
    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})

export const toysgamesSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),


})

export const sportsoutdoorSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")
        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),
    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})

export const fictionalbooksstationarySchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")
        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),
    publisher: Yup.string().min(2).max(25).required("Please enter name of  publisher"),
    genre: Yup.string().min(2).max(25).required("Please enter Genre"),

})

export const nonfictionalbooksstationarySchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")
        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),
    brand: Yup.string().min(2).max(25).required("Please enter Brand"),
    typeofsupplies: Yup.string().min(2).max(25).required("Please enter Type of Supplies"),

})

export const beveragefoodbeveragesSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),
    typeofbeverage: Yup.string().min(2).max(25).required("Please enter Type of Beverage"),


})
export const dryfruitsfoodbeveragesSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")
        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),
    brand: Yup.string().min(2).max(25).required("Please enter Brand"),
    packagingtype: Yup.string().min(2).max(25).required("Please enter packaging type"),

})
export const foodbeveragesSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")
        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),
    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})

export const mensclothingSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),


    material: Yup.string().min(2).max(25).required("Please enter Material"),


})

export const womensclothingSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),


    material: Yup.string().min(2).max(25).required("Please enter Material"),

})

export const automotiveSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

    fueltype: Yup.string().min(2).max(25).required("Please enter Fuel type"),
    model: Yup.string().min(2).max(25).required("Please enter Model Name and Year"),

})

export const partsautomotiveSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})

export const babykidsSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})

export const officeschoolSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),


})

export const artscollectibleSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})

export const electronicsaccessoriesSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})

export const smartdevicesSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),


})

export const homeapplianceSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})
export const musicinstrumentSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),

    brand: Yup.string().min(2).max(25).required("Please enter Brand"),

})

export const servicesSchema = Yup.object({
    ad_title: Yup.string().min(2).max(25).required("Please enter Ad Title"),
    price: Yup.number()
        .typeError("Enter a valid Price") // Display this error message if the input is not a number
        .min(1, "Price must be at least 1 characters")

        .required("Please enter Price"),
    locationcity: Yup.string().min(2).max(25).required("Please enter City Name"),
    locationstate: Yup.string().min(2).max(25).required("Please enter State Name"),
    locationcountry: Yup.string().min(2).max(25).required("Please enter  Country Name"),
    description: Yup.string().min(2).required("Please enter description"),


})

export const addresFormSchema = Yup.object().shape({
    given_name_address: Yup.string().required('First name is required'),
    family_name_address: Yup.string().required('Last name is required'),
    // selected_country: Yup.string().required('Country is required'),
    country_address: Yup.string().required('Country is required'),
    apt_address: Yup.string().required('Apartment is required'),
    city_address: Yup.string().required('City is required'),
    // subregion: Yup.string().required('Subregion is required'),
    region_address: Yup.string().required('Region is required'),
    phone_address: Yup.string().required('Phone Number is required'),
    zip_address: Yup
        .string()
        .matches(/^\d{5}(?:-\d{4})?$|^\d{6}$/, 'Invalid ZIP code format')
        .required('ZIP code is required'),
    email_address: Yup.string().email('Invalid email address').required('Email is required'),
});
