export const nudgeEmailTemplate = (userName: string) => `
  <div style="background-color: #fdfcf8; padding: 40px; font-family: 'Georgia', serif; color: #1a3f22; border: 8px solid #f4ebd0; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #1a3f22; color: #d4a373; display: inline-block; padding: 10px 20px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; font-size: 12px;">
        BookPulse Archives
      </div>
    </div>

    <h1 style="color: #1a3f22; font-size: 28px; text-align: center; margin-bottom: 10px;">
      Where’d you go, ${userName.split(" ")[0]}? 
    </h1>
    
    <p style="font-size: 18px; text-align: center; color: #8b5a2b; font-style: italic; margin-bottom: 30px;">
      The stories are waiting, and the pages aren't turning themselves!
    </p>

    <div style="background-color: #ffffff; padding: 30px; border: 1px dashed #d4a373; text-align: center; margin-bottom: 30px; border-radius: 4px;">
      <p style="font-size: 16px; line-height: 1.6; margin: 0;">
        It’s been <strong>3 days</strong> since your last scribble. <br/>
        Did you get stuck on a cliffhanger? Or maybe you found a secret passage in the library? 
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-top: 15px;">
        Your fellowship misses your insights, and your "Reading Shelf" is looking a little lonely.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}" 
         style="display: inline-block; background-color: #1a3f22; color: #f4ebd0; padding: 18px 35px; text-decoration: none; font-weight: bold; font-size: 18px; shadow: 4px 4px 0px #d4a373; border-radius: 2px;">
        Turn the Next Page
      </a>
    </div>

    <div style="margin-top: 50px; text-align: center; border-top: 1px solid #f4ebd0; paddingTop: 20px;">
      <p style="font-size: 12px; color: #8b5a2b; text-transform: uppercase; letter-spacing: 1px;">
        Don't leave the hero waiting. See you back at the circle!
      </p>
      <p style="font-size: 10px; color: #ccc; margin-top: 10px;">
        BookPulse • The intimate digital reading circle.
      </p>
    </div>
  </div>
`;
