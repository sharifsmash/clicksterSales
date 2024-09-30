require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

// Read the service account key from the file
const serviceAccount = JSON.parse(fs.readFileSync('./secrets/serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Read the data file
const data = require('./data.json');

async function uploadData() {
  const batch = db.batch();

  // Upload overall stats
  const overallStatsRef = db.collection('overall_stats').doc(data.date_range.replace(' - ', '_'));
  batch.set(overallStatsRef, {
    dateRange: data.date_range,
    metrics: data.total
  });

  // Upload campaigns
  for (const campaign of data.campaigns) {
    const campaignRef = db.collection('campaigns').doc(campaign.id);
    const { by_os, by_region, ...campaignData } = campaign;
    batch.set(campaignRef, campaignData);

    // Upload OS data
    for (const osData of by_os) {
      const osRef = db.collection('campaign_os_data').doc();
      batch.set(osRef, {
        campaignId: campaign.id,
        os: osData.name,
        metrics: osData
      });
    }

    // Upload region data
    for (const regionData of by_region) {
      const regionRef = db.collection('campaign_region_data').doc();
      batch.set(regionRef, {
        campaignId: campaign.id,
        region: regionData.name,
        metrics: regionData
      });
    }
  }

  await batch.commit();
  console.log('Data uploaded successfully');
}

uploadData().catch(console.error);