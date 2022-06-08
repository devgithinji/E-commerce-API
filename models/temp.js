/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
    {
        '$match': {
            'product': new ObjectId('62a072a73c5bddf8fa5fc4b2')
        }
    }, {
        '$group': {
            '_id': null,
            'averageRating': {
                '$avg': '$rating'
            },
            'numberOfReviews': {
                '$sum': 1
            }
        }
    }
];

MongoClient.connect(
    '',
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(connectErr, client) {
        assert.equal(null, connectErr);
        const coll = client.db('').collection('');
        coll.aggregate(agg, (cmdErr, result) => {
            assert.equal(null, cmdErr);
        });
        client.close();
    });