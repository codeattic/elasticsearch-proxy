module.exports = {

	/**
	 * No transformation.
	 */
	none(data) {
		return data
	},

	/**
	 * Transforms a JSON document into a javascript object.
	 */
	json(data) {
		return JSON.parse(data);
	},

	/**
	 * Transforms a bulk request with one JSON document per line into an array of javascript objects.
	 */
	jsonBulk(data) {
		return data
			.split(/[\r\n]+/)
			.filter(s => s.length > 0)
			.map(JSON.parse);
	},

	/**
	 * Transforms a JSON document containing Elasticsearch documents into an array of javascript objects with the documents.
	 */
	jsonDocs(data) {
		return findDocs(JSON.parse(data));
	},

	/**
	 * Transforms a JSON document containing Elasticsearch documents into an array of javascript objects with the document IDs.
	 */
	jsonDocIds(data) {
		return findDocs(JSON.parse(data)).map(doc => `${doc._index}:${doc._type}:${doc._id}`);
	}
};

/**
 * Extracts all the elasticsearch documents found in a given javascript object.
 */
function findDocs(object) {
	const docs = [];
	findDocsInternal(docs, object);
	return docs;
}

/**
 * Extracts all the elasticsearch documents found in a given javascript object.
 * This method walks a hierarchy looking for objects with _id attributes and populates the docs array with all the objects found.
 */
function findDocsInternal(docs, object) {
	// checks if object is an elasticsearch document
	if (object._id) {
		docs.push(object);
		return;
	}

	// walks all the object properties recursively
	for (let key in object) {
		const value = object[key];
		if (value != null && typeof value === "object") {
			findDocsInternal(docs, value);
		}
	}
}
