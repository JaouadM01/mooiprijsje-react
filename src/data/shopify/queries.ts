const MONEY = 'amount currencyCode'
const IMAGE = 'url altText'
const PAGE_INFO = 'pageInfo { hasNextPage hasPreviousPage startCursor endCursor }'

const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCard on Product {
    id
    handle
    title
    productType
    featuredImage { ${IMAGE} }
    images(first: 2) { nodes { ${IMAGE} } }
    variants(first: 10) {
      nodes {
        id
        availableForSale
        price { ${MONEY} }
        compareAtPrice { ${MONEY} }
      }
    }
  }
`

export const COLLECTION_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD_FRAGMENT}
  query Collection(
    $handle: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      handle
      title
      descriptionHtml
      products(
        first: $first
        last: $last
        after: $after
        before: $before
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        nodes { ...ProductCard }
        ${PAGE_INFO}
        filters { id label type values { id label count input } }
      }
    }
  }
`

/** /collections/all bestaat niet als echte collectie in de Storefront API. */
export const ALL_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD_FRAGMENT}
  query AllProducts(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(first: $first, last: $last, after: $after, before: $before, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...ProductCard }
      ${PAGE_INFO}
    }
  }
`

export const SEARCH_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD_FRAGMENT}
  query Search($term: String!, $first: Int, $last: Int, $after: String, $before: String) {
    search(query: $term, first: $first, last: $last, after: $after, before: $before, types: [PRODUCT]) {
      totalCount
      nodes { ... on Product { ...ProductCard } }
      ${PAGE_INFO}
    }
  }
`

/** quantityAvailable vereist een extra toegangsscope, dus alleen op verzoek. */
export function buildProductQuery(readInventory: boolean): string {
  return /* GraphQL */ `
    query Product($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        vendor
        productType
        descriptionHtml
        images(first: 10) { nodes { ${IMAGE} } }
        options { name values }
        variants(first: 100) {
          nodes {
            id
            title
            availableForSale
            ${readInventory ? 'quantityAvailable' : ''}
            price { ${MONEY} }
            compareAtPrice { ${MONEY} }
            selectedOptions { name value }
            image { ${IMAGE} }
          }
        }
        collections(first: 1) { nodes { handle title } }
        shortDescription: metafield(namespace: "custom", key: "short_description") { value }
        specifications: metafield(namespace: "custom", key: "specifications") { value }
        faq: metafield(namespace: "custom", key: "faq") { value }
      }
    }
  `
}

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { ${MONEY} } }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { ${MONEY} } amountPerQuantity { ${MONEY} } }
        merchandise {
          ... on ProductVariant {
            id
            title
            image { ${IMAGE} }
            product { handle title }
          }
        }
      }
    }
  }
`

export const CART_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query Cart($id: ID!) {
    cart(id: $id) { ...CartFields }
  }
`

export const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartFields }
      userErrors { message }
    }
  }
`

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { message }
    }
  }
`

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { message }
    }
  }
`

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { message }
    }
  }
`
