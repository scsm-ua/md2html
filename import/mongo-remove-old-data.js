printjson('footnotes', db.footnotes.deleteMany({before_update: {$exists: true}}))
printjson('posts', db.posts.deleteMany({before_update: {$exists: true}}))
printjson('shlokas', db.shlokas.deleteMany({before_update: {$exists: true}}))
printjson('tags', db.tags.deleteMany({before_update: {$exists: true}}))
printjson('topics', db.topics.deleteMany({before_update: {$exists: true}}))
printjson('years', db.years.deleteMany({before_update: {$exists: true}}))
printjson('years-grouped', db['years-grouped'].deleteMany({before_update: {$exists: true}}))

