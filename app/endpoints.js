function getEndpoint(analysisId) {
    var endpoint;
    if (analysisId === 1) {
        endpoint = "https://ndaxqwnr55.execute-api.us-east-1.amazonaws.com/prod";
    }
    else if (analysisId === 2) {
        endpoint = "https://e5lfum0mci.execute-api.us-east-1.amazonaws.com/prod";
    }

    return endpoint;
}
