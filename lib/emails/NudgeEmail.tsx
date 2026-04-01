export const nudgeEmailTemplate = (userName: string) => `
  <div style="background-color: #fdfcf8; padding: 40px; font-family: 'Georgia', serif; color: #1a3f22; border: 8px solid #f4ebd0; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #1a3f22; color: #d4a373; display: inline-block; padding: 10px 20px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; font-size: 12px;">
        BookPulse Archives
      </div>
    </div>

    <h1 style="color: #1a3f22; font-size: 26px; text-align: center; margin-bottom: 10px;">
      Still on that cliffhanger, ${userName.split(" ")[0]}? 
    </h1>
    
    <p style="font-size: 18px; text-align: center; color: #8b5a2b; font-style: italic; margin-bottom: 30px;">
      The archives have been quiet for 5 days...
    </p>

    <div style="background-color: #ffffff; padding: 30px; border: 1px dashed #d4a373; text-align: center; margin-bottom: 30px;">
      <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #1a3f22;">
        Our records show your quill hasn't touched the paper in a while. 
        Your reading fellowship misses your insights, and the pages aren't going to turn themselves!
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}" 
         style="display: inline-block; background-color: #1a3f22; color: #f4ebd0; padding: 18px 35px; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 2px;">
        Turn the Next Page
      </a>
    </div>

    <div style="margin-top: 50px; text-align: center; border-top: 1px solid #f4ebd0; padding-top: 20px;">
      <p style="font-size: 11px; color: #8b5a2b; line-height: 1.5;">
        Sent via lozi.me Authorized Protocol. <br/>
        Too many dispatches? You can disable these reminders in 
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/settings" style="color: #1a3f22; font-weight: bold; text-decoration: underline;">The Setup</a>.
      </p>
      <p style="font-size: 10px; color: #ccc; margin-top: 10px; text-transform: uppercase; letter-spacing: 2px;">
        BookPulse • 2026 Archive
      </p>
    </div>
  </div>
`;