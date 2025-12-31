import paypal from '@paypal/checkout-server-sdk';

const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_SECRET!
);

const client = new paypal.core.PayPalHttpClient(environment);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        // Create subscription plan (you'll need to create this in PayPal dashboard first)
        // For now, creating a one-time payment order
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                description: 'PDFauto.ai Pro Monthly Subscription',
                amount: {
                    currency_code: 'USD',
                    value: '4.99'
                }
            }],
            application_context: {
                brand_name: 'PDFauto.ai',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW',
                return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment-success`,
                cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment-cancelled`
            }
        });

        const order = await client.execute(request);
        const approvalUrl = order.result.links.find(link => link.rel === 'approve')?.href;

        return res.status(200).json({
            orderId: order.result.id,
            approvalUrl
        });

    } catch (error) {
        console.error('PayPal error:', error);
        return res.status(500).json({ error: 'Failed to create payment order' });
    }
}
