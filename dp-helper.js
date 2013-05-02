var Reddit = Reddit || {};

Reddit.modhash = null;
$.getJSON('/api/me.json', function(me) {
    Reddit.modhash = me.data.modhash;
});

Reddit.api = function(subreddit, api) {
    return '/r/' + subreddit + '/api/' + api + '.json';
};

Reddit.subreddit = function() {
    var match = location.pathname.match(/\/r\/([^/]+)/);
    if (match) {
        return match[1].toLowerCase();
    } else {
        return null;
    }
};


function Flair(subreddit, user) {
    this.subreddit = subreddit;
    this.user = user;
}

Flair.prototype.text = function(text, callback) {
    if (Object.prototype.toString.call(text) === "[object String]") {
        /* Set */
        $.post(Reddit.api(this.subreddit, 'selectflair'), {
            name: this.user,
            flair_template_id: '6893c150-b364-11e2-9d30-12313b0b21ae',
            text: text,
            uh: Reddit.modhash
        }, function() {
            if (callback) {
                callback(text);
            }
        });
    } else {
        /* Get */
        callback = text;
        $.getJSON(Reddit.api(this.subreddit, 'flairlist'), {
            name: 'skeeto'
        }, function(data) {
            if (callback) {
                callback(data.users[0].flair_text);
            }
        });
    }
};


function Medals($flair) {
    this.$flair = $flair;
    this.values = $flair.text().split(/ +/).map(parseFloat);
    var subreddit = Reddit.subreddit();
    var user = $flair.parent().find('.author:first').text();
    this.flair = new Flair(subreddit, user);
}

Medals.prototype.modify = function(type, amount) {
    amount = amount != null ? amount : 1;
    this.values[type] += amount;
    this.flair.text(this.values.join(' '), function(text) {
        this.$flair.text(text);
    }.bind(this));
    return this.values[type];
};



$('.flair').css('cursor', 'pointer').each(function() {
    var $flair = $(this);
    var medals = new Medals($flair);
    $flair.click(function(event) {
        var type = Math.round(event.offsetX / $(this).width());
        medals.modify(type, 1);
    });
    $flair.bind('contextmenu', function(event) {
        var type = Math.round(event.offsetX / $(this).width());
        medals.modify(type, -1);
        return false;
    });
});
