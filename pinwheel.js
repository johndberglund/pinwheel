//var nextPolyList = [];
var transforms = [];
var adjList = [[2,-1],[-2,1],[4,2],[3,1],[2,4],[1,3],[-1,3]];
var banList = [[-1,2],[-2,-1],[1,-2],[2,1]];
var myShape = [[0,0],[-1,2.5],[2.5,2.5],[2.5,1]];
var newShape;

function init() {
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");
  c.height = window.innerHeight-220;
  c.width = window.innerWidth-205;

  setOrder();
}

function resize() {
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");
  c.height = (window.innerHeight-220);
  c.width = (window.innerWidth-205);

  setOrder();
}

function setOrder() {
  var maxOrder = document.getElementById("order").value;
  var oldPolyList = [[[1,2]]];
  var nextPolyList = [];
  if (maxOrder < 5) {
    for (var k = 2;k<=maxOrder; k++) {
      nextPolyList = nextOrderPolys(oldPolyList);
      oldPolyList = nextPolyList;
    }
  }
  draw(nextPolyList,maxOrder);
}

function coord2Trans(x,y) {
  var Xslide = 5*Math.round(x/5);
  var Yslide = 5*Math.round(y/5);
  var newX = x-Xslide;
  var newY = y-Yslide;
  var signX = Math.sign(newX);
  var signY = Math.sign(newY);
  var absX = Math.abs(newX);
  var absY = Math.abs(newY);
//alert([x,y,Xslide,Yslide,newX,newY,signX,signY,absX,absY]);
// we should have {absX,absY}={1,2}
  var transMat = [];
  if (absX===1) {
    transMat.push(signX);
    transMat.push(0);
    transMat.push(0);
    transMat.push(0);
    transMat.push(signY);
    transMat.push(0);
  } else {
    transMat.push(0);
    transMat.push(signY);
    transMat.push(0);
    transMat.push(signX);
    transMat.push(0);
    transMat.push(0);
  }
  transMat.push(Xslide);
  transMat.push(Yslide);
  transMat.push(1);
//alert(["*",transMat]);
  return(transMat);
} // end coord2Trans

// turn coordinates into an inversetransformation matrix
function coord2Inv(x,y) {
  var thisMat = coord2Trans(x,y);
  thisMat = invTrans(thisMat);
  return(thisMat);
}

// multiply a vector times a matrix to get a vector.
function multVectMat(vect, mat) {
  var reVect = JSON.parse(JSON.stringify(vect));
  if (reVect.length === 2) {reVect.push(1)}
  var v1 = reVect[0]*mat[0]+ reVect[1]*mat[3]+ reVect[2]*mat[6];
  var v2 = reVect[0]*mat[1]+ reVect[1]*mat[4]+ reVect[2]*mat[7];
  var v3 = reVect[0]*mat[2]+ reVect[1]*mat[5]+ reVect[2]*mat[8];
  return([v1,v2]);
}

// this is the inverse of a transformation matrix.
function invTrans(mat) {
  var newMat = [0,0,0,0,0,0,0,0,1];
  var myFactor = 1/(mat[0]*mat[4]-mat[1]*mat[3]);
  newMat[0]=mat[4]*myFactor;
  newMat[1]=-mat[1]*myFactor;
  newMat[3]=-mat[3]*myFactor;
  newMat[4]=mat[0]*myFactor;
  newMat[6]=-mat[6]*newMat[0]-mat[7]*newMat[3];
  newMat[7]=-mat[6]*newMat[1]-mat[7]*newMat[4];
  return(newMat);
}

function nextOrderPolys(N_1List) {
//alert(N_1List);
  var NList = [];
  var newPoly;
  N_1List.forEach(function(N_1Poly) {
    var notFormList = findMapped(N_1Poly,banList);
    notFormList = dropDupForm(notFormList);
    var adjFormList = findMapped(N_1Poly,adjList);
    adjFormList = keepUnique(adjFormList,notFormList);
    adjFormList = dropDupForm(adjFormList);
    adjFormList = keepUnique(adjFormList,N_1Poly);
    adjFormList.forEach(function(adjForm) {
      newPoly = JSON.parse(JSON.stringify(N_1Poly));
      newPoly.push(adjForm);
      newPoly = sortForm(newPoly);
      if (transPolyUnique(newPoly,NList)) {

        NList.push(newPoly);
      }

    });
  });
  return(NList);
}

function sortForm(blah) {
  blah.sort(function(a,b) { return a[0]-b[0] || a[1]-b[1] });
  return(blah);
}

function findMapped(poly,mapList) {
  var mapped= [];
  poly.forEach(function(myForm) {
    var thisMat = coord2Trans(myForm[0],myForm[1]);
    mapList.forEach(function(mapForm) {
      var nextMapped = multVectMat(mapForm,thisMat);
      mapped.push([nextMapped[0],nextMapped[1]]);
    });

  });
  return(mapped);
}

function trans(myPoly,myMat) {
// transform each form in myPoly by myMat
  var thatPoly = [];
  myPoly.forEach(function(thatForm) {
    thatPoly.push(multVectMat(thatForm,myMat));
  });
  return(thatPoly);
}

// return a list with no duplicates
function dropDupForm(myList) {
  var newList = [];
  myList.forEach(function(item) {
    var itemStr = JSON.stringify(item);
    var duplicate = 0;
    for (var i = 0; i< newList.length; i++) {
      var newItem = newList[i];
      if(JSON.stringify(newItem) === itemStr) {
        duplicate = 1;
        break;
      }
    }
    if (duplicate === 0) {newList.push(item)}
  });
  return(newList);
}

// keep the items from list1 that aren't in list2.
function keepUnique(list1,list2) {
  var newList = [];
  list1.forEach(function(item) {
    var itemStr = JSON.stringify(item);
    var duplicate = 0;
    for (var i = 0; i< list2.length; i++) {
      var newItem = list2[i]
      if(JSON.stringify(newItem) === itemStr) {
        duplicate = 1;
        break;
      }
    }
    if (duplicate === 0) {newList.push(item)}
  });
  return(newList);
}

// check if any transform of the poly is in the list
function transPolyUnique(poly,thisList) {
  var thisListStr = [];
  thisList.forEach(function(oldPoly) {
    thisListStr.push(JSON.stringify(oldPoly));
  });
  var unique = 1;
  poly.forEach(function(myForm) {
    var myMat = coord2Inv(myForm[0],myForm[1]);
    var transPoly = trans(poly,myMat);
    transPoly = sortForm(transPoly);
    var transPolyStr = JSON.stringify(transPoly);
    thisListStr.forEach(function(oldPoly) {
// do I want to compute this once and store? yes.
      if (oldPoly === transPolyStr) 
        {unique = 0;}
    });
  });
  return(unique);
}

function goSaveData() {
  var maxOrder = document.getElementById("order").value;
  var oldPolyList = [[[1,2]]];
  var nextPolyList = [];
  for (var k = 2;k<=maxOrder; k++) {
    nextPolyList = nextOrderPolys(oldPolyList);
    oldPolyList = nextPolyList;
  }
  goSave(nextPolyList,maxOrder);

}

function txtToFile(content, filename, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], {type: "text/plain", endings: "native"});
  
  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};

function goSave(polyList,level) {
  var asOutput = "";
  polyList.forEach(function(poly) {
    asOutput = asOutput.concat("poly:"+"\r\n");
    poly.forEach(function(eachForm) {
      asOutput = asOutput.concat(""+eachForm[0]+","+eachForm[1]+"\r\n");
    });
  });
  asOutput = asOutput.concat("end"+"\r\n");
  var fileName = "polyform" + level;
  txtToFile(asOutput,fileName,"txt");
}

function goSaveSvg() {
  var maxOrder = document.getElementById("order").value;
  var oldPolyList = [[[1,2]]];
  var nextPolyList = [];
  for (var k = 2;k<=maxOrder; k++) {
    nextPolyList = nextOrderPolys(oldPolyList);
    oldPolyList = nextPolyList;
  }
  goSvg(nextPolyList,maxOrder);
}

function svgToFile(content, filename, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], {type: "image/svg+xml", endings: "native"});
  
  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};

function goSvg(polyList,level) {
  var thisSize = 20*level;
  var thisHeight = thisSize*10;
  var thisWidth = thisSize*Math.ceil(polyList.length/10);
  var asOutput = '<svg height="' + thisHeight + '" width="' +thisWidth + '">\r\n';
  for (var j=0;j<polyList.length;j++) {
    var thisRow = Math.floor(j/10);
    var thisCol = j-thisRow*10;
    var thisPoly = polyList[j];
    var myMat;

    thisPoly.forEach(function(nextPt){
      asOutput = asOutput.concat('<polygon points="\r\n'); 
      myMat = coord2Trans(nextPt[0],nextPt[1]);
      newShape = [];
      myShape.forEach(function(pt) {
        var nextOne = multVectMat([pt[0],pt[1],1],myMat);
        newShape.push([nextOne[0],nextOne[1]]);
      });
      for (var i = 0;i<newShape.length;i++) {
        var sPoint = "" + (newShape[i][0]*4+thisSize*thisRow+thisSize/2) +
                     "," + (-newShape[i][1]*4+thisSize*thisCol+thisSize/2);
        asOutput = asOutput.concat(sPoint,"\r\n");
      }
      asOutput = asOutput.concat('" style="fill:white;stroke:black;stroke-width:1" />\r\n'); 
    }); // end thisPoly loop
  } // end for loop
  asOutput = asOutput.concat('</svg>');
  var fileName = "polyform" + level;
  svgToFile(asOutput,fileName,"svg");
}

function draw(polyList, level) {
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");
  context.beginPath();
  context.rect(0,0,c.width,c.height);
  context.fillStyle = "white";
  context.fill();

  if (level<5) {

    var thisSize = 20*level;
    var thisHeight = thisSize*10;
    var thisWidth = thisSize*Math.ceil(polyList.length/10);
    c.width = thisWidth;
    c.height = thisHeight;
    for (var j=0;j<polyList.length;j++) {
      var thisRow = Math.floor(j/10);
      var thisCol = j-thisRow*10;
      var thisPoly = polyList[j];
      var myMat;
      thisPoly.forEach(function(nextPt){
        myMat = coord2Trans(nextPt[0],nextPt[1]);
        newShape = [];
        myShape.forEach(function(pt) {
          var nextOne = multVectMat([pt[0],pt[1],1],myMat);
          newShape.push([nextOne[0],nextOne[1]]);
        });

        context.moveTo(newShape[0][0]*4+thisSize*thisRow+thisSize/2,50-newShape[0][1]*4+thisSize*thisCol);
        for (var i = 1;i<newShape.length;i++) {
          context.lineTo(newShape[i][0]*4+thisSize*thisRow+thisSize/2,50-newShape[i][1]*4+thisSize*thisCol);
          context.stroke();
        }
        context.lineTo(newShape[0][0]*4+thisSize*thisRow+thisSize/2,50-newShape[0][1]*4+thisSize*thisCol);
        context.stroke();
      }); // end thisPoly loop
    } // end for loop

  } else {
    c.width = 400;
    c.height = 100;
    context.font = "12px Arial";
    context.fillText("Try downloading. I won't show the big ones on the screen.",10,20);
  }

} // end draw()
