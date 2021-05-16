
   var options={
       //指定图表类型
       chart:{type: 'column',backgroundColor:null},
       //指定标题
       title: {
        text: 'Risk of being killed or seriously injured while cycling in London (2000-2017)',
        //设置字体大小
        style:{fontSize:'12px',fontFamily:'Futura',}
    },
       //副标题
       subtitle: {
        text: 'Data From: STATS19 Collision Data',
        style:{fontSize:'8px',fontFamily:'Futura'}
    },
       //设置横坐标名称
       xAxis: {
        categories: [
            '2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017'
        ],
        labels:{
            style:{fontSize:'8px',fontFamily:'Futura'}
        }
        //十字准星crosshair: true
    },
       //设置纵坐标名称
       yAxis: {
        min: 0,
        title: {
            text: 'Risk Index',
            style:{fontSize: '12px',fontFamily:'Futura',fontWeight: "blod"}
        },
        labels:{
            style:{fontSize:'8px',fontFamily:'Futura'}
        }
    },

       //数据框设置
       tooltip: {
        //数据提示框头部格式化字符
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat:'<td style="padding:0;font-size:12px"><b>{point.y:.1f}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true,//显示阴影
        valueDecimals: 2,
        borderRadius:10,//边框圆角
        backgroundColor:'#F2F2F2',//背景颜色
        borderColor:'#F2F2F2', //边框颜色
        borderWidth: 0,//边框宽度
        style: {// 文字内容相关样式
        color: "#000000",
        fontSize: "12px",
        fontWeight: "blod",
        fontFamily: "Arial"
    },
    },
    //

    plotOptions: {
        column: {
            //设置柱边框
            borderWidth:0
        },
        series:{
            //设置柱颜色
            color:'#46B29A'
        }
    },
    series: [{
        showInLegend: false,//不显示name
        name: 'Risk Index',
        data: [1.0, 1.1, 0.8, 0.9, 0.58, 0.65, 0.6, 0.58, 0.58, 0.6,0.6,0.65,0.7,0.55,0.53,0.4,0.38,0.35]
    }],
    //去掉logo
    credits: {
    enabled: false
},
    //去掉导出按钮
    exporting: { enabled:false }
    }

    //用函数选择以上设置
    $("#container_line").highcharts(options);