import React, { useState } from 'react';

export default function App() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState({ type: null, message: '' });

    const handleBulkDispatch = async () => {
        setIsProcessing(true);
        setStatus({ type: 'info', message: 'Connecting to Supabase database...' });

        // Retrieve environment variables from your Vite config
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            setStatus({
                type: 'error',
                message: 'Missing Supabase credentials in your .env file (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
            });
            setIsProcessing(false);
            return;
        }

        if (!WEB3FORMS_ACCESS_KEY) {
            setStatus({
                type: 'error',
                message: 'Missing VITE_WEB3FORMS_ACCESS_KEY in your .env file.',
            });
            setIsProcessing(false);
            return;
        }

        try {
            // Fetch clients directly from your Supabase table where status is exactly 'pending'
            const response = await fetch(`${SUPABASE_URL}/rest/v1/Leads?status=eq.Interested&select=*`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Supabase returned status code ${response.status}`);
            }

            const pendingClients = await response.json();

            if (!pendingClients || pendingClients.length === 0) {
                setStatus({
                    type: 'success',
                    message: 'Zero pending clients found in your database.',
                });
                setIsProcessing(false);
                return;
            }

            setStatus({
                type: 'info',
                message: `Found ${pendingClients.length} pending client(s). Processing dispatch...`,
            });

            let successCount = 0;
            let failCount = 0;

            // Loop over pending clients and dispatch emails via Web3Forms
            for (const client of pendingClients) {
                try {
                    const clientName = client.to_name || client.name || 'Value Client';
                    const clientEmail = client.to_email || client.email;
                    const desiredCourse = client.role_title || client.course_interest || 'Any IT Course';
                    const budgetDetails = client.compensation_details || 'Custom Institution Package';
                    const proposedDate = client.start_date || 'Flexible Scheduled Term';
                    const bookingLink = client.acceptance_link || 'https://corecodeindustries.com';

                    if (!clientEmail) {
                        failCount++;
                        continue;
                    }

                    // Structured email layout
                    const emailHtmlBody = `
            <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; border-radius: 8px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="background-color: #1e3a8a; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 25px -30px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Course Proposal</h1>
                  <p style="color: #93c5fd; margin: 5px 0 0 0; font-size: 14px;">Join our online IT Institute</p>
                </div>
                
                <p>Dear <strong>${clientName}</strong>,</p>
                <p>I am reaching out on behalf of <strong>CoreCodeIndustries</strong>. We believe there is an exciting opportunity for us to collaborate and take your digital expertise to the next level.</p>
                <p>We have put together a preliminary strategy tailored to your learning needs. We would love to hop on a quick connection call to share our ideas and learn more about your goals.</p>
                
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />

                <h3 style="color: #1e3a8a; font-size: 16px; margin: 0 0 10px 0; text-transform: uppercase;">Collaboration Overview</h3>
                <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                  <tr>
                    <td style="color: #64748b; font-weight: bold; width: 40%;">Proposed Focus:</td>
                    <td style="color: #1e293b;">${desiredCourse}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: bold;">Estimated Value Range:</td>
                    <td style="color: #1e293b; font-weight: 600;">${budgetDetails}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: bold;">Proposed Meeting Date:</td>
                    <td style="color: #1e293b;">${proposedDate}</td>
                  </tr>
                </table>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${bookingLink}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Book a Connection Call</a>
                </div>

                <p style="font-size: 12px; color: #94a3b8; margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
                  <strong>Core Code Industries</strong><br />
                  For inquiries, reply to: <a href="mailto:corecodeindustries@gmail.com" style="color: #2563eb; text-decoration: none;">corecodeindustries@gmail.com</a>
                </p>
              </div>
            </div>
          `;

                    // Post to Web3Forms API
                    const web3formsResponse = await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            access_key: WEB3FORMS_ACCESS_KEY,
                            name: 'Core Code Industries',
                            email: 'corecodeindustries@gmail.com',
                            subject: `IT Course & Partnership Proposal for ${clientName}`,
                            replyto: 'm.hassaan.amin.0412@gmail.com',
                            message: `Proposal automatically sent to pending client: ${clientName}`,
                            html: emailHtmlBody
                        })
                    });

                    const web3formsResult = await web3formsResponse.json();
                    if (web3formsResult.success) {
                        successCount++;

                        // Update client status in Supabase to 'sent'
                        await fetch(`${SUPABASE_URL}/rest/v1/Leads?id=eq.${client.id}`, {
                            method: 'PATCH',
                            headers: {
                                'apikey': SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ status: 'sent' })
                        });

                    } else {
                        failCount++;
                    }
                } catch (err) {
                    failCount++;
                }
            }

            setStatus({
                type: 'success',
                message: `Bulk dispatch completed. Sent to ${successCount} clients.` + (failCount > 0 ? ` Failed: ${failCount}` : ''),
            });

        } catch (globalError) {
            setStatus({
                type: 'error',
                message: 'Could not connect to database. Check your network or environment configurations.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-6">

            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner">
                🚀
            </div>

            <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Core Code Dispatcher</h1>
                <p className="text-sm text-slate-500">
                    Click the button below to fetch pending clients from Supabase and dispatch partnership proposals instantly.
                </p>
            </div>

            <button
                onClick={handleBulkDispatch}
                disabled={isProcessing}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white tracking-wide shadow-lg transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-95 ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isProcessing ? 'Processing Dispatch...' : 'Send Proposal to Pending Clients'}
            </button>

            {status.message && (
                <div className={`p-4 rounded-xl text-xs text-left leading-relaxed border transition-all duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    status.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                    <div className="font-semibold">{status.message}</div>
                </div>
            )}

        </div>
    );
}