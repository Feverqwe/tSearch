function apprise(string, args, callback)
{
    var default_args = {
        'confirm': false,
        'verify': false,
        'input': false,
        'animate': false,
        'textOk': 'Ok',
        'textCancel': 'Cancel',
        'textYes': 'Yes',
        'textNo': 'No'
    }
    if (args)
    {
        for (var index in default_args)

        {
            if (typeof args[index] == "undefined")
                args[index] = default_args[index];
        }
    }
    var aHeight = $(document).height();
    var aWidth = $(document).width();
    $('body').append('<div class="appriseOverlay" id="aOverlay"></div>');
    $('.appriseOverlay').css('height', aHeight).css('width', aWidth).fadeIn(100);
    $('body').append('<div class="appriseOuter"></div>');
    $('.appriseOuter').append('<div class="appriseInner"></div>');
    if (typeof(string) != 'object') {
        $('.appriseInner').append(string);
    }
    $('.appriseOuter').css("left", ($(window).width() - $('.appriseOuter').width()) / 2 + $(window).scrollLeft() + "px");
    if (args)
    {
        if (args['animate'])

        {
            var aniSpeed = args['animate'];
            if (isNaN(aniSpeed)) {
                aniSpeed = 400;
            }
            $('.appriseOuter').css('top', '-200px').show().animate({
                top: "0px"
            }, aniSpeed);
        }
        else
        {
            $('.appriseOuter').css('top', '0px').fadeIn(200);
        }
    }
    else
    {
        $('.appriseOuter').css('top', '0px').fadeIn(200);
    }
    if (args)
    {
        if (args['input'])
        {
            if (typeof(args['input']) == 'string')
            {
                $('.appriseInner').append('<div class="aInput"><input type="text" class="aTextbox" t="aTextbox" value="' + args['input'] + '" /></div>');
                $('.aTextbox').focus();
            }
            else
            if (typeof(args['input']) == 'object')
            {
                for (var i = 0; i < args['input'].length; i++) {
                    $('.appriseInner').append(string[i]);
                    $('.appriseInner').append('<div class="aInput"><input type="text" class="aTextbox num_' + i + '" t="aTextbox" value="' + args['input'][i] + '" /></div>');
                }
                $('.aTextbox.num_0').focus();
            }
            else
            {
                $('.appriseInner').append('<div class="aInput"><input type="text" class="aTextbox" t="aTextbox" /></div>');
                $('.aTextbox').focus();
            }
        }
    }
    $('.appriseInner').append('<div class="aButtons"></div>');
    if (args)
    {
        if (args['confirm'] || args['input'])
        {
            $('.aButtons').append('<button value="ok">' + args['textOk'] + '</button>');
            $('.aButtons').append('<button value="cancel">' + args['textCancel'] + '</button>');
        }
        else if (args['verify'])
        {
            $('.aButtons').append('<button value="ok">' + args['textYes'] + '</button>');
            $('.aButtons').append('<button value="cancel">' + args['textNo'] + '</button>');
        }
        else
        {
            $('.aButtons').append('<button value="ok">' + args['textOk'] + '</button>');
        }
    }
    else
    {
        $('.aButtons').append('<button value="ok">Ok</button>');
    }
    $(document).keydown(function(e)
    {
        if ($('.appriseOverlay').is(':visible'))

        {
            if (e.keyCode == 13)

            {
                $('.aButtons > button[value="ok"]').trigger('click');
            }
            if (e.keyCode == 27)
            {
                $('.aButtons > button[value="cancel"]').trigger('click');
            }
        }
    });
    if (args['input'] && typeof(args['input']) != 'object') {
        var aText = $('.aTextbox').val();
        if (!aText) {
            aText = false;
        }
        $('.aTextbox').keyup(function()
        {
            aText = $(this).val();
        });
    }
    $('.aButtons > button').on('click', function()
    {
        if (args['input'] && typeof(args['input']) == 'object') {
            var arr = []
            for (var i = 0; i < args['input'].length; i++) {
                arr.push($('.aTextbox' + '.num_' + i).val());
            }
        }
        $('.appriseOverlay').remove();
        $('.appriseOuter').remove();
        if (callback)
        {
            var wButton = $(this).attr("value");
            if (wButton == 'ok')
            {
                if (args)
                {
                    if (args['input'] && typeof(args['input']) == 'object') {
                        if (args['id'] != null)
                            callback(args['id'], arr);
                        else
                            callback(arr);
                    } else
                    if (args['input'])
                    {
                        if (args['id'] != null)
                            callback(args['id'], aText);
                        else
                            callback(aText);
                    }
                    else
                    {
                        callback(true);
                    }
                }
                else
                {
                    callback(true);
                }
            }
            else if (wButton == 'cancel')
            {
                callback(false);
            }
        }
    });
}