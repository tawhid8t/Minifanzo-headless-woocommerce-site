export default async function handler(req, res) {
  const WC_URL = process.env.NEXT_PUBLIC_WC_URL;
  const WC_KEY = process.env.WC_CONSUMER_KEY;
  const WC_SECRET = process.env.WC_CONSUMER_SECRET;
  
  if (!WC_URL || !WC_KEY || !WC_SECRET) {
    return res.status(500).json({ error: 'Missing WooCommerce credentials' });
  }
  
  const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  const apiBase = `${WC_URL}/wp-json/wc/v3`;
  
  try {
    // Fetch a single product to see all fields
    const productsRes = await fetch(`${apiBase}/products?per_page=1&_embed=true`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    const products = await productsRes.json();
    
    if (!products || products.length === 0) {
      return res.status(200).json({ message: 'No products found', products: [] });
    }
    
    const product = products[0];
    
    // Return all keys to see what's available
    const debugInfo = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ? product.description.substring(0, 500) + '...' : null,
      short_description: product.short_description ? product.short_description.substring(0, 500) + '...' : null,
      images: product.images,
      attributes: product.attributes,
      meta_data: product.meta_data,
      _embedded: product._embedded,
      all_keys: Object.keys(product)
    };
    
    res.status(200).json(debugInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
