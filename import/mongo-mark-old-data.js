printjson('footnotes', db.footnotes.updateMany({}, {$set:{before_update: new Date()}}))
printjson('posts', db.posts.updateMany({}, {$set:{before_update: new Date()}}))
printjson('tags', db.tags.updateMany({}, {$set:{before_update: new Date()}}))
printjson('topics', db.topics.updateMany({}, {$set:{before_update: new Date()}}))
printjson('years', db.years.updateMany({}, {$set:{before_update: new Date()}}))
