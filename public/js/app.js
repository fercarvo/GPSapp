angular.module('app', ['ui.router'])
    .config(["$stateProvider", "$compileProvider", function ($stateProvider, $compileProvider) {
        $stateProvider
            .state('bitacora_crear', {
                templateUrl: '/views/bitacora/crear.html',
                controller: 'bitacora_crear'
            })
            .state('bitacora_listar', {
                templateUrl: '/views/bitacora/listar.html',
                controller: 'bitacora_listar'
            })           
    }])
    .run(["$state", "$http", "$templateCache", "oportunidad", function ($state, $http, $templateCache, op) {
        loadTemplates($state, "bitacora_crear", $http, $templateCache)

    }])
    .factory('oportunidad', [function(){
        return {
            data: null
        }
    }])
    .directive("loadedDatatable", ['$rootScope', function($rootScope){
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                if (scope.$last) {
                    console.log('termino', attrs.loadedDatatable)
                    $rootScope.$broadcast(attrs.loadedDatatable)
                }
            }
        }
    }])
    .controller('bitacora_crear', ["$scope", "oportunidad", "$http", "$state", function($scope, gestion, $http, $state){

        $scope.ref_actividad = [
            {key: "A", value: "Ronda"}, 
            {key: "B", value: "Guardia nocturna"}, 
            {key: "C", value: "Denuncia de robo"}
        ];

        /*$http.get('/referencia/actividad')
            .then(res => {
                $scope.ref_actividad = res.data;

            })
            .catch(e => alert(e.status +" "+ e.statusText))*/

        $scope.fecha_gestion = new Date();

        $scope.gestion_actual = "gestion.data.descripcion"

        $scope.cancelar = () => $state.reload();

        $scope.tomarFoto = async () => {

            const img = document.querySelector('#screenshot img');
            const video = document.querySelector('#screenshot video');
            const constraints = { video: {
                width: { ideal: 4096 },
                height: { ideal: 2160 }
            }}

            const canvas = document.createElement('canvas');
            video.style.display = 'block'
            img.style.display = 'none'

            navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

            /*video.onclick = function() {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                
                //console.log(canvas.getContext('2d').getImageData(0,0,canvas.width, canvas.height))
                
                // Other browsers will fall back to image/png
                img.src = canvas.to
                img.src = canvas.toDataURL('image/png');
                stopStream();
                video.style.display = 'none'
                img.style.display = 'block'
            }*/

            video.onclick = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);

                canvas.toBlob(blob => {
                    var url = URL.createObjectURL(blob)
                    img.src = url

                    stopStream();
                    video.style.display = 'none'
                    img.style.display = 'block'
                }, 'image/jpeg', 1)
            }


            function handleSuccess(stream) {
                window.stream = stream; // make stream available to console
                video.srcObject = stream;
            }

            function handleError(error) {
                console.error('Error: ', error);
            }

            function stopStream() {
                console.log(window.stream.getTracks())
                window.stream.getTracks().forEach(track => track.stop())
            }
        }
        
        $scope.crearGestion = async function (tipo_actividad, fecha, descripcion, siguiente_ac, f_siguiente_ac) {
            /*try {                
                var data = {
                    tipo_actividad, 
                    fecha: moment(fecha).format('YYYY-MM-DD'), 
                    descripcion, 
                    siguiente_ac, 
                    f_siguiente_ac: moment(f_siguiente_ac).format('YYYY-MM-DD') 
                }

                var { data } = await $http.post(`/gestion/${"gestion.data.c_contactactivity_id"}/nueva`, data);
                console.log(data);
                alert(data)
                
            } catch (e) { console.log(e); alert ("error, crear gestion"); } 
            */
            alert("Version beta, bitácora registrada a las " + new Date() );    
        }

        console.log("gestion.data");

    }])
    .controller('bitacora_listar', ["$scope", "oportunidad", "$http", "$state", function($scope, gestion, $http, $state){

    }])


async function loadTemplates($state, goState, $http, $templateCache) {
    try {
        var promises = []
        var states = $state.get()

        for (i = 1; i < states.length; i++) {
            var p = $http.get(states[i].templateUrl, { cache: $templateCache })
            promises.push(p)
            p.then(function () { }, function (error) { console.log("Error template: ", error) })
        }

        await Promise.all(promises)
                
    } catch (e) {
        console.log("Error templates catch: " + e)
    } finally {
        $state.go(goState) ///////////////////////// State inicial
        document.body.style.pointerEvents = "all"
    }
    
}


async function cargarTabla (id, url, arrColumnas) {
    try {
        var data = await fetch(url, {credentials: "same-origin"})

        if (data.ok)
            data = await data.json();
        else
            throw new Error(`Status: ${data.status}, ${data.statusText}`);

        document.getElementById(id).innerHTML = `
            <thead>
                <tr>
                    ${arrColumnas.reduce((html, obj) => {
                        return html + `<th> ${obj.alias} </th>`;
                    }, '')}
                </tr>
            </thead>
            <tbody>
                ${data.rows.reduce((html, row) => {
                    return html + `
                        <tr> 
                            ${arrColumnas.reduce((htmlr, obj) => {
                                return htmlr + `
                                <td> ${obj.name ? (row[obj.name] || '') : obj.cb(escribir(row))} </td>`;        
                            }, '')}
                        </tr>`;
                }, '')}
            </tbody>
        `;
        
        $(`#${id}`).DataTable({ responsive: true })

    } catch (e) {
        console.log(e);
        alert(e.message)
    }
}

function escribir( json ) {
    return window.btoa(unescape(encodeURIComponent( JSON.stringify(json) )));
}

function leer( str ) {
    return JSON.parse( decodeURIComponent(escape(window.atob( str ))) )
}
