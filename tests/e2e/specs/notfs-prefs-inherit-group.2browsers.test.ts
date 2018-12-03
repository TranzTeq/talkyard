/// <reference path="../test-types.ts"/>

import * as _ from 'lodash';
import assert = require('assert');
import server = require('../utils/server');
import utils = require('../utils/utils');
import pagesFor = require('../utils/pages-for');
import settings = require('../utils/settings');
import make = require('../utils/make');
import logAndDie = require('../utils/log-and-die');
import c = require('../test-constants');

declare const browser: any;
declare var browserA: any;
declare var browserB: any;
declare var browserC: any;

let richBrowserA;
let richBrowserB;

let owen;
let owensBrowser;
let modya;
let modyasBrowser;
let maria;
let mariasBrowser;
let trillian;
let trilliansBrowser;

let idAddress: IdAddress;
let siteId: any;

let url;

let numEmailsToTrillian = 0;
let numEmailsToMaria = 0;
let numEmailsToModya = 0;

const forumTitle = "Notf Pref Inh Grps Content";
const SpecificCatName = 'SpecificCatName';
const OtherCatName = 'OtherCatName';

const TitleOneTrilliianNotfd = 'TitleOneTrilliianNotfd';
const BodyOneTrilliianNotfd = 'BodyOneTrilliianNotfd';

const TitleTwoEveryoneNotfd = 'TitleTwoEveryoneNotfd';
const BodyTwoEveryoneNotfd = 'BodyTwoEveryoneNotfd';

const TopicTwoReplyNoNotfs = 'TopicTwoReplyNoNotfs';
const TopicTwoReplyTrillianEveryPost = 'TopicTwoReplyTrillianEveryPost';
const TopicTwoReplyMariaEveryPost = 'TopicTwoReplyMariaEveryPost';

const TitleThreeNotfsTrillian = 'TitleThreeNotfsTrillian';
const BodyThreeNotfsTrillian = 'BodyThreeNotfsTrillian';

const TitleFourNotfsAll = 'TitleFourNotfsAll';
const BodyFourNotfsAll = 'BodyFourNotfsAll';

const TopicFourReplyTrillianModyaNotfd = 'TopicFourReplyTrillianModyaNotfd';
const TopicFourReplyThreeMariaModya = 'TopicFourReplyThreeMariaModya';
const TopicFourReplyFourTrillanModya = 'TopicFourReplyFourTrillanModya';


describe("notfs-prefs-inherit-group  TyT5RKT2WJ04", () => {

  it("initialize people", () => {
    richBrowserA = _.assign(browserA, pagesFor(browserA));
    richBrowserB = _.assign(browserB, pagesFor(browserB));
    owensBrowser = richBrowserA;
    modyasBrowser = richBrowserB;
    mariasBrowser = richBrowserB;
    trilliansBrowser = richBrowserB;

    owen = make.memberOwenOwner();
    modya = make.memberModeratorModya();
    maria = make.memberMaria();
    maria.trustLevel = c.TestTrustLevel.Basic;
    trillian = make.memberTrillian();
  });

  it("import a site", () => {
    const site: SiteData = make.forumOwnedByOwen('notf-inh-grp', { title: forumTitle });
    site.members.push(modya);
    site.members.push(maria);
    site.members.push(trillian);
    idAddress = server.importSiteData(site);
    siteId = idAddress.id;
  });


  it("Owen logs in", () => {
    owensBrowser.go(idAddress.origin + '/categories');
    owensBrowser.complex.loginWithPasswordViaTopbar(owen);
  });

  it("Creates a Specific category", () => {
    owensBrowser.complex.createCategory({ name: SpecificCatName });
  });

  it("... and an Other category", () => {
    owensBrowser.complex.createCategory({ name: OtherCatName });
  });



  // Whole site
  // =======================================================


  // ----- Trusted members group subscribes to New Topics

  it("Owen configs New Topics subscr, Trusted members, whole site: " +
      "goes to the Trusted group", () => {
    owensBrowser.topbar.clickGoToAdmin();
    owensBrowser.adminArea.switchToGroupsBuiltIn();
  });

  it("... click click", () => {
    owensBrowser.adminArea.groups.openTrustedMembersGroup();
  });

  it("... to notf settings", () => {
    owensBrowser.userProfilePage.clickGoToPreferences();
    owensBrowser.userProfilePage.preferences.switchToNotifications();
  });

  it("... and configs notfs", () => {
    owensBrowser.userProfilePage.preferences.notfs.setSiteNotfLevel(c.TestPageNotfLevel.NewTopics);
  });

  it("Owen posts a topic", () => {
    owensBrowser.go('/latest')
    owensBrowser.complex.createAndSaveTopic({
        title: TitleOneTrilliianNotfd, body: BodyOneTrilliianNotfd });
    numEmailsToTrillian += 1;  // trusted member
    numEmailsToModya += 1;     // is staff, incl in the trusted members group
  });

  it("Trillian get notified", () => {
    const titleBody = [TitleOneTrilliianNotfd, BodyOneTrilliianNotfd];
    server.waitUntilLastEmailMatches(siteId, trillian.emailAddress, titleBody, browser);
  });

  it("... once, exactly", () => {
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
  });

  it("... but not Maria", () => {
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

  it("... and yes, Modya, because is staff", () => {
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  // ----- All members group subscribes to New Topics

  it("Owen configs New Topics subscr, All Members, whole site: " +
      "goes to the All Members group", () => {
    owensBrowser.userProfilePage.openNotfPrefsFor(c.NewMembersId);
  });

  it("... and configs notfs", () => {
    owensBrowser.userProfilePage.preferences.notfs.setSiteNotfLevel(c.TestPageNotfLevel.NewTopics);
  });

  it("Owen posts another topic", () => {
    owensBrowser.go('/latest')
    owensBrowser.complex.createAndSaveTopic({
        title: TitleTwoEveryoneNotfd, body: BodyTwoEveryoneNotfd });
    numEmailsToTrillian += 1;
    numEmailsToMaria += 1;
    numEmailsToModya += 1;
  });

  it("Trillian get notified, once", () => {
    const titleBody = [TitleTwoEveryoneNotfd, BodyTwoEveryoneNotfd];
    server.waitUntilLastEmailMatches(siteId, trillian.emailAddress, titleBody, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
  });

  it("... and Maria", () => {
    const titleBody = [TitleTwoEveryoneNotfd, BodyTwoEveryoneNotfd];
    server.waitUntilLastEmailMatches(siteId, maria.emailAddress, titleBody, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

  it("... and Modya", () => {
    const titleBody = [TitleTwoEveryoneNotfd, BodyTwoEveryoneNotfd];
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, titleBody, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  // ----- No one notfd about a reply

  it("Owen posts a reply", () => {
    owensBrowser.complex.replyToOrigPost(TopicTwoReplyNoNotfs);
  });

  it("... another, mentions @mod_modya", () => {
    owensBrowser.complex.replyToOrigPost("Hi @mod_modya");
    url = owensBrowser.url().value;
    numEmailsToModya += 1;
  });

  it("Modya gets notified about the mention, only", () => {
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, 'Hi @mod_modya', browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  it("The others didn't get notfd about anything", () => {
    // Email counts unchanged.
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

  // ----- Trusted members subscribes to Every Post, notfd about a reply

  it("Owen subscrs Trusted members to Every Post, whole site: " +
      "goes to the Trusted Members group", () => {
    owensBrowser.userProfilePage.openNotfPrefsFor(c.TrustedMembersId);
  });

  it("... and configs notfs", () => {
    owensBrowser.userProfilePage.preferences.notfs.setSiteNotfLevel(c.TestPageNotfLevel.EveryPost);
  });

  it("Returns and posts a reply", () => {
    owensBrowser.go(url);
    owensBrowser.complex.replyToOrigPost(TopicTwoReplyTrillianEveryPost);
    numEmailsToTrillian += 1;
    numEmailsToModya += 1;    // staff incl in Trusted Members group
  });

  it("Trillian gets notified", () => {
    const reply = [TopicTwoReplyTrillianEveryPost];
    server.waitUntilLastEmailMatches(siteId, trillian.emailAddress, reply, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
  });

  it("... and Modya", () => {
    const reply = [TopicTwoReplyTrillianEveryPost];
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, reply, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  it("... Maria didn't get notfd about anything", () => {
    // Email counts unchanged.
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

  // ----- Trillian mutes site; Mara subscrs to Every Post

  it("Trillian  goes to her notf prefs", () => {
    trilliansBrowser.go(idAddress.origin);
    trilliansBrowser.complex.loginWithPasswordViaTopbar(trillian);
    trilliansBrowser.userProfilePage.openPreferencesFor(trillian.username);
    trilliansBrowser.userProfilePage.preferences.switchToNotifications();
  });

  it("... mutes the whole site", () => {
    trilliansBrowser.userProfilePage.preferences.notfs.setSiteNotfLevel(c.TestPageNotfLevel.Muted);
  });

  it("Maria goes to her notfs prefs", () => {
    trilliansBrowser.topbar.clickLogout();
    mariasBrowser.complex.loginWithPasswordViaTopbar(maria);
    mariasBrowser.userProfilePage.openPreferencesFor(maria.username);
    mariasBrowser.userProfilePage.preferences.switchToNotifications();
  });

  it("... subscrs to Every Post", () => {
    mariasBrowser.userProfilePage.preferences.notfs.setSiteNotfLevel(c.TestPageNotfLevel.EveryPost);
  });

  it("Owen posts yet another reply", () => {
    owensBrowser.complex.replyToOrigPost(TopicTwoReplyMariaEveryPost);
    numEmailsToMaria += 1;
    numEmailsToModya += 1;
  });

  it("... this time, Maria gets notified", () => {
    const reply = [TopicTwoReplyMariaEveryPost];
    server.waitUntilLastEmailMatches(siteId, maria.emailAddress, reply, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

  it("... and Modya", () => {
    const reply = [TopicTwoReplyMariaEveryPost];
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, reply, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  it("... not Trillian", () => {
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
  });

  it("Maria mutes the whole site", () => {
    mariasBrowser.userProfilePage.preferences.notfs.setSiteNotfLevel(c.TestPageNotfLevel.Muted);
  });

  it("Owen posts yet another reply, mentions Modya again", () => {
    owensBrowser.complex.replyToOrigPost("Hi again @mod_modya");
    numEmailsToModya += 1;
  });

  it("... Modya gets notified, again", () => {
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, "Hi again @mod_modya", browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  it("The others didn't get notfd: both Maria and Trillian have muted the site", () => {
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });



  // Category
  // =======================================================


  // ----- Trusted members group subscribes to Spec Cat: New Topics

  it ("Owen configs Trusted Members, Spec Cat: New Topics, ... by impersonating ...", () => {
    owensBrowser.adminArea.goToUser(c.TrustedMembersId);
    owensBrowser.adminArea.user.startImpersonating();
  });

  it("... configs as Trusted member ...", () => {
    owensBrowser.go('/categories');
    // [2ABKF057]
    owensBrowser.forumCategoryList.setCatNrNotfLevel(2, c.TestPageNotfLevel.NewTopics);
  });

  it("... stops impersonating ...", () => {
    owensBrowser.topbar.clickStopImpersonating();
  });

  it("Owen creates a topic: opens the Specific category", () => {
    owensBrowser.forumCategoryList.openCategory(SpecificCatName);
  });

  it("... and posts the topic", () => {
    owensBrowser.complex.createAndSaveTopic({
        title: TitleThreeNotfsTrillian, body: BodyThreeNotfsTrillian });
    numEmailsToTrillian += 1;
    numEmailsToModya += 1;
  });

  it("... Trillian gets notified: the Trusted group is subscr to the cat, New Topics", () => {
    const titleBody = [TitleThreeNotfsTrillian, BodyThreeNotfsTrillian];
    server.waitUntilLastEmailMatches(siteId, trillian.emailAddress, titleBody, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
  });

  it("... and Modya, since is staff", () => {
    const titleBody = [TitleThreeNotfsTrillian, BodyThreeNotfsTrillian];
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, titleBody, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  it("... not Maria", () => {
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

  // ----- All members subscribes to Spec Cat: New Topics

  it ("Owen configs All Members, Spec Cat: New Topics, ... by impersonating ...", () => {
    owensBrowser.adminArea.goToUser(c.NewMembersId);
    owensBrowser.adminArea.user.startImpersonating();
  });

  it("... configs as All member, again — this overrides members' whole-site-Muted setting", () => {
    owensBrowser.go('/categories');
    // [2ABKF057]
    owensBrowser.forumCategoryList.setCatNrNotfLevel(2, c.TestPageNotfLevel.NewTopics);
  });

  it("... stops impersonating, agan ...", () => {
    owensBrowser.topbar.clickStopImpersonating();
  });

  it("Owen creates a topic: opens the Specific category", () => {
    owensBrowser.forumCategoryList.openCategory(SpecificCatName);
  });

  it("... and posts the topic", () => {
    owensBrowser.complex.createAndSaveTopic({ title: TitleFourNotfsAll, body: BodyFourNotfsAll });
    numEmailsToTrillian += 1;
    numEmailsToMaria += 1;
    numEmailsToModya += 1;
  });

  it("... Trillian gets notified", () => {
    const titleBody = [TitleFourNotfsAll, BodyFourNotfsAll];
    server.waitUntilLastEmailMatches(siteId, trillian.emailAddress, titleBody, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
  });

  it("... and Modya, since is staff", () => {
    const titleBody = [TitleFourNotfsAll, BodyFourNotfsAll];
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, titleBody, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  it("... and Maria, since Everyone listens for new topics now", () => {
    const titleBody = [TitleFourNotfsAll, BodyFourNotfsAll];
    server.waitUntilLastEmailMatches(siteId, maria.emailAddress, titleBody, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

  it("Owen posts a reply, mentions Modya for the 3rd time", () => {
    owensBrowser.complex.replyToOrigPost("Hi 3rd time @mod_modya");
    url = owensBrowser.url().value;
    numEmailsToModya += 1;
  });

  it("... Modya gets notified, for the 3rd time", () => {
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, "Hi 3rd time @mod_modya", browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  it("... but no one else — they only get notfd about new topics", () => {
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

  // ----- Trusted members subscribes to Every Topic, Spec Cat

  it ("Owen configs Full Members, Spec Cat: Every Topics, ... by impersonating ...", () => {
    owensBrowser.adminArea.goToUser(c.FullMembersId);
    owensBrowser.adminArea.user.startImpersonating();
  });

  it("... configs as Full Member", () => {
    owensBrowser.go('/categories');
    // [2ABKF057]
    owensBrowser.forumCategoryList.setCatNrNotfLevel(2, c.TestPageNotfLevel.EveryPost);
  });

  it("... stops impersonating, agan ...", () => {
    owensBrowser.topbar.clickStopImpersonating();
  });

  it("Owen replies, now when Full Members subscribed to Every Post", () => {
    owensBrowser.go(url);
    owensBrowser.complex.replyToOrigPost(TopicFourReplyTrillianModyaNotfd);
    numEmailsToTrillian += 1;   // Trusted member, incl in Full Members group
    numEmailsToModya += 1;      // Staff, also included
  });

  it("... Trillian gets notified", () => {
    const reply = [TopicFourReplyTrillianModyaNotfd];
    server.waitUntilLastEmailMatches(siteId, trillian.emailAddress, reply, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
  });

  it("... Modya gets notified", () => {
    const reply = [TopicFourReplyTrillianModyaNotfd];
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, reply, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  it("... not Maria — she's a Basic member only, not in the Full Members group", () => {
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

  // ----- Members override per cat nots

  it ("Maria subscr to Every Post in Spec Cat", () => {
    mariasBrowser.go('/categories');
    mariasBrowser.forumCategoryList.setCatNrNotfLevel(2, c.TestPageNotfLevel.EveryPost);
  });

  it ("Trillian mutes Spec Cat", () => {
    mariasBrowser.topbar.clickLogout();
    trilliansBrowser.complex.loginWithPasswordViaTopbar(trillian);
    trilliansBrowser.forumCategoryList.setCatNrNotfLevel(2, c.TestPageNotfLevel.Muted);
  });

  it("Owen replies, again, now when Maria and Trillian have overridden the cat notf prefs", () => {
    owensBrowser.complex.replyToOrigPost(TopicFourReplyThreeMariaModya);
    numEmailsToMaria += 1;   // Has subsribed to Every post
    numEmailsToModya += 1;   // Staff, incl in Full Members, which is cat-subscr
  });

  it("... Maria gets notified", () => {
    const reply = [TopicFourReplyThreeMariaModya];
    server.waitUntilLastEmailMatches(siteId, maria.emailAddress, reply, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

  it("... Modya gets notified", () => {
    const reply = [TopicFourReplyThreeMariaModya];
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, reply, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  it("... not Trillian — she muted the category", () => {
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
  });



  // Page
  // =======================================================

  it("Trillian goes to the page", () => {
    trilliansBrowser.go(url);
  });

  it("... configs replies for every post", () => {
    trilliansBrowser.metabar.setPageNotfLevel(c.TestPageNotfLevel.EveryPost);
  });

  it("Maria mutes the page", () => {
    trilliansBrowser.topbar.clickLogout();
    mariasBrowser.complex.loginWithPasswordViaTopbar(maria);
    mariasBrowser.metabar.setPageNotfLevel(c.TestPageNotfLevel.Muted);
  });

  it("Owen replies. Maria has muted the page, Trillian listens Every Post", () => {
    owensBrowser.complex.replyToOrigPost(TopicFourReplyFourTrillanModya);
    numEmailsToTrillian += 1;  // Has subsribed to Every post on the page
    numEmailsToModya += 1;     // Staff, incl in Full Members, which is cat-subscr
  });

  it("... Trillian gets notified", () => {
    const reply = [TopicFourReplyFourTrillanModya];
    server.waitUntilLastEmailMatches(siteId, trillian.emailAddress, reply, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, trillian.emailAddress), numEmailsToTrillian);
  });

  it("... Modya gets notified, via Full Memebrs category Every Post subscr", () => {
    const reply = [TopicFourReplyFourTrillanModya];
    server.waitUntilLastEmailMatches(siteId, modya.emailAddress, reply, browser);
    assert.equal(server.countLastEmailsSentTo(siteId, modya.emailAddress), numEmailsToModya);
  });

  it("... not Maria — she muted the page", () => {
    assert.equal(server.countLastEmailsSentTo(siteId, maria.emailAddress), numEmailsToMaria);
  });

});
