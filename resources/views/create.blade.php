<div class="text-white m-7">
    @if (isset($item_created) && $item_created)
        <div class="bg-green-900 bg-opacity-70 p-4 rounded text-white text-sm mb-4">
            <p>Successfully created or edited item!</p>
        </div>
    @endif

    @if (isset($id))
    <h1 class="text-3xl font-bold mb-4">Edit Item!</h1>
    @else
    <h1 class="text-3xl font-bold mb-4">Create Item - {{ isset($type) ? ucfirst($type) : 'Mod' }}!</h1>
    @endif
    <div>
        @if (!isset($view) || $view != 'edit')
            <button data-view-btn data-show-id="mod" class="itemBtn text-white font-bold rounded-t p-3 mr-1 bg-opacity-50 {{ !isset($type) || (isset($type) && $type == 'mod') ? 'bg-gray-500' : 'bg-gray-900' }}">Mod</button>
            <button data-view-btn data-show-id="seed" class="itemBtn text-white font-bold rounded-t p-3 mr-1 bg-opacity-50 {{ (isset($type) && $type == 'seed') ? 'bg-gray-500' : 'bg-gray-900' }}">Seed</button>
            <button data-view-btn data-show-id="game" class="itemBtn text-white font-bold rounded-t p-3 mr-1 bg-opacity-50 {{ (isset($type) && $type == 'game') ? 'bg-gray-500' : 'bg-gray-900' }}">Game</button>
        @endif
        
        <form method="POST" action="{{ Illuminate\Support\Facades\URL::to('/create', array('type' => 'mod')) }}" class="flex flex-col bg-black bg-opacity-50 shadow-md rounded px-8 pt-6 pb-8 mb-4" enctype='multipart/form-data'>
            @csrf

            <input type="hidden" name="type" value="{{ isset($type) ? $type : 'mod' }}" />
            @if (isset($id))
            <input type="hidden" name="id" value="{{ $id }}" />
            @endif

            @if (isset($type) && $type == 'game')
            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="image">Image</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image" name="image" type="file" placeholder="Game Image"{{!! isset($image) ? ' value="' . $image . '"' : '' !!}} />

                <input class="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image-remove" name="image-remove" type="checkbox" value="0" /> <label class="inline align-middle text-gray-200 text-sm font-bold mb-2" for="image-remove">Remove Current</label>
                
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="name">Name</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="name" name="name" type="text" placeholder="Game Name"{{!! isset($name) ? ' value="' . $name . '"' : '' !!}} />
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="name_short">Name Short</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="name_short" name="name_short" type="text" placeholder="Short Game Name"{{!! isset($name_short) ? ' value="' . $name_short . '"' : '' !!}} />
            </div>
            
            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="classes">Classes</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="classes" name="classes" type="text" placeholder="CSS Classes"{{!! isset($classes) ? ' value="' . $classes . '"' : '' !!}} />
            </div>
            @elseif (isset($type) && $type == 'seed')
            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="image">Image</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image" name="image" type="file" placeholder="Seed Image" />

                <input class="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image-remove" name="image-remove" type="checkbox" /> <label class="inline align-middle text-gray-200 text-sm font-bold mb-2" for="image-remove">Remove Current</label>
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="image_banner">Image Banner</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image_banner" name="image_banner" type="file" placeholder="Seed Image Banner" />

                <input class="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image_banner-remove" name="image_banner-remove" type="checkbox" /> <label class="inline align-middle text-gray-200 text-sm font-bold mb-2" for="image_banner-remove">Remove Current</label>
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="name">Name</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="name" name="name" type="text" placeholder="Seed Name"{{ isset($name) ? ' value="' . $name . '"' : '' }} />
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="protocol">Protocol</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="protocol" name="protocol" type="text" placeholder="https"{{!! isset($protocol) ? ' value="' . $protocol . '"' : '' !!}} />
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="url">URL</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="url" name="url" type="text" placeholder="moddingcommunity.com"{{!! isset($url) ? ' value="' . $url . '"' : '' !!}} />
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="classes">Classes</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="classes" name="classes" type="text" placeholder="CSS Classes"{{!! isset($classes) ? ' value="' . $classes . '"' : '' !!}} />
            </div>
            @else
            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="image">Image</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image" name="image" type="file" placeholder="Mod Image" />

                <input class="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image-remove" name="image-remove" type="checkbox" /> <label class="inline align-middle text-gray-200 text-sm font-bold mb-2" for="image-remove">Remove Current</label>
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="seed">Seed</label>
                <select class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="seed" name="seed" >
                    @if (isset($seeds))
                        @foreach ($seeds as $seed)
                            <option value="{{ $seed->id }}"{{ (isset($seedReal) && $seedReal->id == $seed->id) ? ' selected' : '' }}>{{ $seed->name }}</option>
                        @endforeach
                    @endif
                </select>
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="game">Game</label>
                <select class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="game" name="game">
                    @if (isset($games))
                        @foreach ($games as $game)
                            <option value="{{ $game->id }}"{{ (isset($gameReal) && $gameReal->id == $game->id) ? ' selected' : '' }}>{{ $game->name }}</option>
                        @endforeach
                    @endif
                </select>
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="name">Name</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="name" name="name" type="text" placeholder="Mod Name" {{!! isset($name) ? ' value="' . $name . '"' : '' !!}} />
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="url">URL</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="url" name="url" type="text" placeholder="something/to/somewhere" {{!! isset($url) ? ' value="' . $url . '"' : '' !!}} />
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="custom_url">Custom URL</label>
                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="custom_url" name="custom_url" type="text" placeholder="modexample" {{!! isset($custom_url) ? ' value="' . $custom_url . '"' : '' !!}} />
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="description">Description</label>
                <textarea rows="16" cols="32" class="shadow appearance-none border-blue-900 rounded w-full p-6 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="description" name="description" placeholder="More about this project.">{{ isset($description) ? $description  : '' }}</textarea>
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="description_short">Description Short</label>
                <textarea rows="8" cols="16" class="shadow appearance-none border-blue-900 rounded w-full p-6 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="description_short" name="description_short" placeholder="More about this project.">{{ isset($description_short) ? $description_short  : '' }}</textarea>
            </div>

            <div class="mb-4">
                <label class="block text-gray-200 text-sm font-bold mb-2" for="install_help">Install Help</label>
                <textarea rows="16" cols="32" class="shadow appearance-none border-blue-900 rounded w-full p-6 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="install_help" name="install_help" placeholder="Installation help.">{{ isset($install_help) ? $install_help  : '' }}</textarea>
            </div>

            <div class="mb-4">
                <h2 class="text-xl">Download URLs</h2>

                <div id="downloads">
                    @if (isset($downloads) && count($downloads))
                        @foreach ($downloads as $key => $download)
                            @php
                                $itemID = $key + 1;
                            @endphp

                            <div id="download-{{ $itemID }}">
                                <label class="block text-gray-200 text-sm mt-4 font-bold mb-2" for="download-{{ $itemID }}-name">Name</label>
                                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="download-{{ $itemID }}-name" name="download-{{ $itemID }}-name" type="text" placeholder="Display name of file." value="{{ $download['name'] }}" />

                                <label class="block text-gray-200 text-sm mt-3 font-bold mb-2" for="download-{{ $itemID }}-url">URL</label>
                                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="download-{{ $itemID }}-url" name="download-{{ $itemID }}-url" type="text" placeholder="URL of file." value="{{ $download['url'] }}" />

                                <button type="button" class="dl-rm-btn text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2 mt-2">Remove</button>
                            </div>
                        @endforeach
                    @else
                        <div id="download-1">
                            <label class="block text-gray-200 text-sm mt-4 font-bold mb-2" for="download-1-name">Name</label>
                            <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="download-1-name" name="download-1-name" type="text" placeholder="Display name of file." />

                            <label class="block text-gray-200 text-sm mt-3 font-bold mb-2" for="download-1-url">URL</label>
                            <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="download-1-url" name="download-1-url" type="text" placeholder="URL of file." />

                            <button type="button" class="dl-rm-btn text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2 mt-2">Remove</button>
                        </div>
                    @endif
                </div>

                <button type="button" id="downloadsBtn" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add More</button>
            </div>

            <div class="mb-4">
                <h2 class="text-xl">Screenshots</h2>

                <div id="screenshots">
                    @if (isset($screenshots) && count($screenshots))
                        @foreach ($screenshots as $key => $screenshot)
                            @php
                                    $itemID = $key + 1;
                            @endphp
                            
                            <div id="screenshot-{{ $itemID }}">
                                <label class="block text-gray-200 text-sm mt-3 font-bold mb-2" for="screenshot-{{ $itemID }}-url">URL</label>
                                <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="screenshot-{{ $itemID }}-url" name="screenshot-{{ $itemID }}-url" type="text" placeholder="URL to screenshot." value="{{ $screenshot }}" />

                                <button type="button" class="ss-rm-btn text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2 mt-2">Remove</button>
                            </div>
                        @endforeach
                    @else
                        <div id="screenshot-1">
                            <label class="block text-gray-200 text-sm mt-3 font-bold mb-2" for="screenshot-1-url">URL</label>
                            <input class="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="screenshot-1-url" name="screenshot-1-url" type="text" placeholder="URL to screenshot." />

                            <button type="button" class="ss-rm-btn text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2 mt-2">Remove</button>
                        </div>
                    @endif
                </div>

                <button type="button" id="screenshotsBtn" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add More</button>
            </div>
            @endif

            <button type="submit" class="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">{{ isset($id) ? 'Edit!' : 'Add!' }}</button>
        </form>
    </div>
</div>