/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written byAPS Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

"use strict";

const passport = require("koa-passport");
const Router = require("koa-router");

const config = require("config");
const Token = require("./../auth/token");

const router = new Router({ prefix: "/api/aps" });
const url = require("url");
/**
 * Authenticate
 *
 * Calls the Autodesk authenticate URL
 */
router.get(
  "/authenticate",
  passport.authenticate("oauth2", { scope: config.get("scope") })
);

/**
 * Get theAPS App Callback
 *
 * Retrieves the access and refresh tokens
 * from theAPS App callback URL
 */
router.get("/callback/oauth", (ctx) => {
  return passport.authenticate("oauth2", async (err, user) => {
    if (err) ctx.throw(err);
    const tokenSession = new Token(ctx.session);
    await ctx.login(user);
    let apsSession = {
      oauth2: {
        auto_refresh: false,
        client_id: config.get("oauth2.clientID"),
        client_secret: config.get("oauth2.clientSecret"),
        expires_at: "",
        redirect_uri: config.get("oauth2.callbackURL"),
        scope: config.get("scope"),
      },
    };
    tokenSession.setForgeSession(apsSession);
    ctx.redirect(
      url.resolve(
        config.get("vuehost") === "origin"
          ? `http://${ctx.req.headers.host}`
          : config.get("vuehost"),
        "/?isUserLoggedIn=true"
      )
    );
  })(ctx);
});

/**
 * Log out
 *
 * If you need to completely log out fromAPS
 * you will need to implement on the client-side
 * the steps documented in the belowAPS article
 * https://aps.autodesk.com/blog/log-out-forge
 */
router.get("/logout", (ctx) => {
  ctx.logout();
  ctx.body = {
    success: true,
    message: "Log out operation complete",
  };
});

router.get("/logoutaccount", (ctx) =>
  ctx.redirect(config.get("logoutaccount_url"))
);

module.exports = router; // eslint-enable no-use-before-define
