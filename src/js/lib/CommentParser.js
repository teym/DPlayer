var DanmuFormat = (function () {
  var danmuFormat = {}

  danmuFormat.JSONParser = function () { }
  danmuFormat.JSONParser.prototype.parseOne = function (comment) {
    var obj = {}
    obj.bdid = comment.i
    obj.text = comment.s
    obj.date = comment.d
    obj.stime = comment.f

    var ss = comment.c.split(',')
    // mode, size, color, pool, opacity, alpha-alpha, border, shadow, font,
    obj.mode = parseInt(ss[0])
    obj.size = parseInt(ss[1])
    obj.color = parseInt(ss[2])
    if (ss[3] && ss[3].length > 0) {
      obj.pool = parseFloat(ss[3]) || 0
    }
    if (ss[4] && ss[4].length > 0) {
      obj.opacity = parseFloat(ss[4]) || 1.0
    }
    if (ss[5] && ss[5].length > 0) {
      var aa = ss[6].split('-')
      var f = parseFloat(aa[0]) || 0
      var t = parseFloat(aa[1]) || 1
      obj.alpha = [f, t]
    }
    obj.border = parseInt(ss[6]) > 0
    obj.shadow = parseInt(ss[7]) > 0
    obj.font = ss[8] || ''

    // [duration, x,y,pos,rx,ry,rz, align, movable, axis, [[[from,to,duration,delay,easing],[from,to,duration,delay,easing]],]
    if (obj.mode > 6 && comment.h && comment.h.length > 0) {
      var hh = JSON.parse(comment.h)
      obj.dur = hh[0]
      obj.x = hh[1]
      obj.y = hh[2]
      obj.position = hh[3] > 0 ? 'relative' : 'absolute'
      if (typeof hh[4] === 'number') {
        obj.rX = hh[4]
      }
      if (typeof hh[5] === 'number') {
        obj.rY = hh[5]
      }
      if (typeof hh[6] === 'number') {
        obj.rZ = hh[6]
      }
      obj.align = hh[7] || 0
      obj.movable = hh[8] > 0
      obj.axis = hh[9] || 0

      obj.motion = hh[10].map(function (i) {
        return {
          x: { from: i[0][0], to: i[0][1], dur: i[0][2], delay: i[0][3], easing: i[0][4] },
          y: { from: i[1][0], to: i[1][1], dur: i[1][2], delay: i[1][3], easing: i[1][4] }
        }
      })
    } else {
      obj.mode = (obj.mode > 6) ? 1 : obj.mode
    }
    return obj
  }

  danmuFormat.JSONParser.prototype.encode = function (obj) {
    var comment = {}
    comment.s = obj.text
    comment.f = obj.stime
    comment.c = [
      obj.mode,
      obj.size,
      obj.color,
      obj.pool,
      obj.opacity || 1,
      (obj.alpha && (obj.alpha.length > 1) ? ('' + obj.alpha[0] + '-' + obj.alpha[1]) : ''),
      (obj.border ? 1 : 0),
      (obj.shadow ? 1 : 0),
      obj.font || ''
    ].map(function (i) { return '' + i }).join(',')

    // [duration, x,y,pos,rx,ry,rz, align, movable, [[[from,to,duration,delay,easing],[from,to,duration,delay,easing]],]
    if (obj.mode > 6) {
      comment.h = JSON.stringify([
        obj.dur,
        obj.x,
        obj.y,
        obj.position === 'relative' ? 1 : 0,
        obj.rX || 0,
        obj.rY || 0,
        obj.rZ || 0,
        obj.align || 0,
        obj.movable ? 1 : 0,
        obj.axis || 0,
        obj.motion.map(function (i) {
          var x = [i.x.from, i.x.to, i.x.dur, i.x.delay].concat(i.x.easing ? [i.x.easing] : [])
          var y = [i.y.from, i.y.to, i.y.dur, i.y.delay].concat(i.y.easing ? [i.y.easing] : [])
          return [x, y]
        })
      ])
    } else {
      comment.h = null
    }
    return comment
  }
  danmuFormat.JSONParser.prototype.buildBase = function ({mode, size, stime, color, text, border}) {
    return {
      text,
      stime,
      mode: mode > 6 ? 1 : mode,
      size,
      color,
      pool: 0,
      opacity: 1,
      alpha: null,
      border: !!border,
      shadow: true,
      font: ''
    }
  }
  return danmuFormat
})()
export { DanmuFormat }
