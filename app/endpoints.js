function getEndpoint(analysisId) {
    var endpoint;
    if (analysisId === 1) {
        endpoint = "https://bnw9h9gzvh.execute-api.us-east-2.amazonaws.com/prod";
    }
    else if (analysisId === 2) {
        endpoint = "https://lurra2s5c7.execute-api.us-east-2.amazonaws.com/prod";
    }

    return endpoint;
}
