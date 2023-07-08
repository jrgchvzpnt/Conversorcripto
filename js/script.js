$(document).ready(function() {
    // Lista de las 10 criptomonedas más utilizadas
    var cryptoList = [
      { id: "bitcoin", name: "Bitcoin" },
      { id: "ethereum", name: "Ethereum" },
      { id: "binancecoin", name: "Binance Coin" },
      { id: "tether", name: "Tether" },
      { id: "cardano", name: "Cardano" },
      { id: "dogecoin", name: "Dogecoin" },
      { id: "xrp", name: "XRP" },
      { id: "polkadot", name: "Polkadot" },
      { id: "litecoin", name: "Litecoin" },
      { id: "bitcoin-cash", name: "Bitcoin Cash" }
    ];
  
    // Rellenar el campo de selección con las criptomonedas disponibles
    function populateCurrencies() {
      var select = $("#crypto");
  
      $.each(cryptoList, function(index, crypto) {
        select.append($("<option>").val(crypto.id).text(crypto.name));
      });
    }
  
    // Obtener la tasa de conversión
    function getExchangeRate(crypto, callback) {
      var apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=mxn`;
      $.getJSON(apiUrl)
        .done(function(data) {
          var exchangeRate = data[crypto].mxn;
          callback(exchangeRate);
        })
        .fail(function(error) {
          console.log(error);
        });
    }
  
    // Obtener el historial de precios de la criptomoneda
    function getCoinPriceHistory(cryptoId, callback) {
      var apiUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=30`;
      $.getJSON(apiUrl)
        .done(function(data) {
          var prices = data.prices;
          var dates = prices.map(function(price) {
            var timestamp = price[0];
            var date = new Date(timestamp);
            return date.toLocaleDateString();
          });
          var values = prices.map(function(price) {
            return price[1]; // Dividir por 1000 para mostrar la variación por cada $1,000
          });
          callback(dates, values);
        })
        .fail(function(error) {
          console.log(error);
        });
    }
  
    // Crear y mostrar la gráfica
    // Crear y mostrar la gráfica
    function createChart(dates, values) {
        var ctx = document.getElementById("chart").getContext("2d");
        var chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: dates,
                datasets: [
                    {
                        label: "Variación del precio",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        borderColor: "rgb(255, 99, 132)",
                        data: values
                    }
                ]
            },
            options: {
                scales: {
                    yAxes: [
                        {   
                            ticks: {
                                callback: function(value, index, values) {
                                    return "$" + value;
                                }
                            }
                        }
                    ]
                }
            }
        });
    }


  
  
    // Actualizar el historial en la tabla
    function updateHistoryTable() {
      var history = JSON.parse(localStorage.getItem("conversionHistory"));
      var tableBody = $("#historyTable tbody");
      tableBody.empty();
  
      if (history && history.length > 0) {
        $.each(history, function(index, item) {
          var row = $("<tr>");
          row.append($("<td>").text(item.units));
          row.append($("<td>").text(item.crypto));
          row.append($("<td>").text(item.price.toFixed(2) + " MXN"));
          tableBody.append(row);
        });
      } else {
        var row = $("<tr>");
        row.append($("<td colspan='3'>").text("No hay historial disponible"));
        tableBody.append(row);
      }
    }
  
    // Manejar el evento de clic del botón de conversión
   // Manejar el evento de clic del botón de conversión
$("#convertBtn").click(function() {
  var crypto = $("#crypto").val();
  var amount = parseFloat($("#amount").val());

  getExchangeRate(crypto, function(exchangeRate) {
    var result = amount * exchangeRate;
    var formattedResult = result.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN"
    });

    $("#result").text(formattedResult);

    // Agregar la conversión al historial
    var conversion = {
      units: amount,
      crypto: $("#crypto option:selected").text(),
      price: result
    };

    var history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    history.push(conversion);
    localStorage.setItem("conversionHistory", JSON.stringify(history));

    // Actualizar la tabla de historial
    updateHistoryTable();
  });

  getCoinPriceHistory(crypto, function(dates, values) {
    createChart(dates, values);
  });
});

  
    // Manejar el evento de clic del botón de borrar historial
    $("#clearBtn").click(function() {
      localStorage.removeItem("conversionHistory");
      updateHistoryTable();
    });
  
    // Obtener y rellenar la lista de criptomonedas al cargar la página
    populateCurrencies();
  
    // Obtener el historial y actualizar la tabla
    updateHistoryTable();
  });
  