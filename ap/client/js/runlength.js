/*https://github.com/dreasgrech/runlength-js/blob/master/rle.js*/
var runlength = (function () {
    var decode = function (input) {
        var repeat = /^\d+/.exec(input), character;
        if (repeat === null) {
            return "";
        }

        repeat = repeat[0];
        character = input[repeat.length];
        return new Array(+repeat + 1).join(character) + decode(input.substr((repeat + character).length));
    };

    return {
        encode: function (input) {
            var i = 0, j = input.length, output = "", lastCharacter, currentCharCount;
                for (; i < j; ++i) {
                    if (typeof lastCharacter === "undefined") {
                        lastCharacter = input[i];
                        currentCharCount = 1;
                        continue;
                    }
                    
                    if (input[i] !== lastCharacter) {
                        output += currentCharCount + lastCharacter;
                        lastCharacter = input[i];                        
                        currentCharCount = 1;
                        continue;
                    }
                    
                    currentCharCount++; 
                }

                return output + (currentCharCount + lastCharacter);
        },
        decode: decode   
    };    
}());